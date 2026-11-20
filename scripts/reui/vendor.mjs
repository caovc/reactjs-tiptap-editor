import crypto from 'node:crypto';
import fs from 'node:fs';

import ts from 'typescript';

import { forwardRefs } from './forward-refs.mjs';

// ReUI v1 is pinned because the current registry deliberately delegates these
// foundational controls to stock shadcn. Never relabel stock shadcn as ReUI.
const revision = 'a98dda1432a74c2e3d6680887325f859eaa32cdf';
const items = JSON.parse(fs.readFileSync(new URL('./registry-v1.json', import.meta.url), 'utf8'));
function prefixToken(token) {
  // Repair verified upstream v1 typos before parsing variant nesting.
  token = token.replace(/,$/, '').replace(/^\[\[&_svg/, '[&_svg');
  let depth = 0;
  let split = -1;
  for (let i = 0; i < token.length; i++) {
    if ('[('.includes(token[i])) depth++;
    if ('])'.includes(token[i])) depth--;
    if (token[i] === ':' && depth === 0) split = i;
  }
  let variants = token.slice(0, split + 1);
  let utility = token.slice(split + 1);
  variants = variants
    .replace(/\[class\*=size-\]/g, '[class*=richtext-size-]')
    .replace(/\.toaster/g, '.richtext-toaster')
    .replace(/\.toast(?=\])/g, '.richtext-toast')
    .replace(/has-data-\[([^\]]+)\]/g, 'has-[[data-$1]]')
    .replace(/in-data-\[([^\]]+)\]/g, '[[data-$1]_&]')
    .replace(/\*:data-slot=([\w-]+)/g, '[&>[data-slot=$1]]')
    .replace(/\*:data-alert-icon/g, '[&>[data-slot=alert-icon]]')
    .replace(/\*:data-slot-\[alert=close\]/g, '[&>[data-slot=alert-close]]')
    .replace(/data-(disabled|placeholder|focus-within)(?=:)/g, 'data-[$1]')
    .replace(/aria-invalid(?=:)/g, 'aria-[invalid=true]');
  utility = utility
    .replace(/^outline-hidden$/, 'outline-none')
    .replace(/^shadow-xs$/, 'shadow-sm')
    .replace(/^black\/(\d+)$/, 'shadow-black/$1')
    .replace(/^\[backdrop-filter:blur\((.*)\)\]$/, 'backdrop-blur-[$1]')
    .replace(/^\[transition-timing-function:cubic-bezier\(0\.16,1,0\.3,1\)\]$/, 'ease-reui')
    .replace(/-\((--[^)]+)\)/g, '-[var($1)]');
  let important = '';
  if (utility.endsWith('!')) {
    utility = utility.slice(0, -1);
    important = '!';
  }
  if (utility.startsWith('!')) {
    utility = utility.slice(1);
    important = '!';
  }
  const negative = utility.startsWith('-');
  if (negative) utility = utility.slice(1);
  return variants + important + (negative ? '-' : '') + 'richtext-' + utility;
}
function classes(value) {
  return value.trim().split(/\s+/).map(prefixToken).join(' ');
}
function inClasses(node) {
  for (let p = node.parent; p; p = p.parent) {
    if (
      ts.isBinaryExpression(p) &&
      [
        ts.SyntaxKind.EqualsEqualsEqualsToken,
        ts.SyntaxKind.ExclamationEqualsEqualsToken,
        ts.SyntaxKind.EqualsEqualsToken,
        ts.SyntaxKind.ExclamationEqualsToken,
      ].includes(p.operatorToken.kind)
    )
      return false;
    if (
      ts.isPropertyAssignment(p) &&
      (p.initializer === node || ts.isArrayLiteralExpression(p.initializer)) &&
      ['variant', 'size', 'mode', 'appearance', 'radius', 'underline', 'underlined'].includes(
        p.name.getText()
      )
    )
      return false;
    if (ts.isJsxAttribute(p)) return p.name.getText() === 'className';
    if (ts.isCallExpression(p) && ['cn', 'cva'].includes(p.expression.getText())) return true;
  }
  return false;
}
const manifest = [];
const only = process.argv.slice(2);
for (const item of items.filter((item) => !only.length || only.includes(item.name))) {
  for (const file of item.files.filter((file) => file.type === 'registry:ui')) {
    let text = file.content;
    const source = ts.createSourceFile(
      item.name + '.tsx',
      text,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );
    const edits = [];
    function visit(node) {
      if (
        (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
        inClasses(node)
      ) {
        // CVA defaults and variant discriminants are not utility classes.
        if (
          /\s/.test(node.text.trim()) ||
          /^(?:-?(?:p[xysetblr]?|m[xysetblr]?|gap|text|bg|border|rounded|size|h|w|opacity|shadow|ring|outline|font|leading|tracking|z|inset|top|right|bottom|left|flex|grid|items|justify|grow|shrink|hidden|block|relative|absolute|fixed|overflow|cursor|transition|duration|animate|pointer|select|truncate|whitespace|sr-only|ms|me|space|group|peer)(?:-|$)|\[)/.test(
            node.text
          )
        ) {
          edits.push({
            start: node.getStart(),
            end: node.end,
            text: JSON.stringify(classes(node.text)),
          });
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    for (const edit of edits.sort((a, b) => b.start - a.start))
      text = text.slice(0, edit.start) + edit.text + text.slice(edit.end);
    text = text.replaceAll('@/registry/default/lib/utils', '@/lib/utils');
    // Portals must participate in the editor's reset/theme boundary too.
    text = text.replace(
      /(<(?:DialogPrimitive|DropdownMenuPrimitive|PopoverPrimitive|SelectPrimitive|TooltipPrimitive)\.Content)\b/g,
      '$1 data-richtext-portal'
    );
    text = text.replace(/(<DialogPrimitive\.Overlay)\b/g, '$1 data-richtext-portal');
    text =
      `// Adapted from keenthemes/reui@${revision}, ${file.path}.\n// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.\n` +
      text;
    if (item.name === 'dropdown-menu') {
      text = text
        .replace('  sideOffset = 4,', '  sideOffset = 4,\n  portalContainer,')
        .replace(
          '}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>)',
          '}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & { portalContainer?: HTMLElement | null })'
        )
        .replace(
          '<DropdownMenuPrimitive.Portal>',
          '<DropdownMenuPrimitive.Portal container={portalContainer}>'
        );
    }
    if (item.name === 'sonner') {
      text = text
        .replace(
          "import { useTheme } from 'next-themes';",
          "import { useTheme } from '@/theme/theme';"
        )
        .replace(
          "theme={theme as ToasterProps['theme']}",
          "theme={theme === 'dark' ? 'dark' : 'light'}"
        );
      // Sonner classNames is a class map, rather than a cn()/CVA call.
      text = text
        .replace(
          /'group toast[^']*'/,
          "'richtext-group richtext-toast richtext-bg-background richtext-text-foreground richtext-border-border richtext-shadow-lg'"
        )
        .replace(/'group-\[\.toast\]:text-muted-foreground'/g, "'richtext-text-muted-foreground'")
        .replace(
          /'group-\[\.toast\]:rounded-md! group-\[\.toast\]:bg-primary group-\[\.toast\]:text-primary-foreground'/g,
          "'richtext-rounded-md richtext-bg-primary richtext-text-primary-foreground'"
        )
        .replace(
          /'group-\[\.toast\]:rounded-md! group-\[\.toast\]:bg-secondary group-\[\.toast\]:text-secondary-foreground!'/g,
          "'richtext-rounded-md richtext-bg-secondary richtext-text-secondary-foreground'"
        );
    }
    text = text.replaceAll('richtext-leading-[var(--text-sm--line-height)]', 'richtext-leading-5');
    text = text.replace(/(<DropdownMenuPrimitive\.SubContent)\b/g, '$1 data-richtext-portal');
    let adapted = forwardRefs(text);
    if (item.name === 'input') {
      // Frimousse owns search data/navigation; ReUI owns the rendered input through Slot.
      adapted = adapted
        .replace(
          "import * as React from 'react';",
          "import * as React from 'react';\nimport { Slot as SlotPrimitive } from 'radix-ui';"
        )
        .replace(
          "React.ComponentProps<'input'> & VariantProps<typeof inputVariants>",
          "React.ComponentProps<'input'> & VariantProps<typeof inputVariants> & { asChild?: boolean }"
        )
        .replace(
          /function Input\(\{\s*className,\s*type,\s*variant,\s*\.\.\.props\s*\}, ref\) \{/,
          "function Input({ className, type, variant, asChild = false, ...props }, ref) {\n  const Comp = asChild ? SlotPrimitive.Slot : 'input';"
        )
        .replace('<input ref={ref}', '<Comp ref={ref}');
      if (!adapted.includes('const Comp = asChild'))
        throw Error('Input Slot adaptation did not match pinned source');
    }
    // Intrinsic overlay sizing must remain viewport-bounded after regenerating
    // official primitives, including when a business form requests a wider size.
    if (item.name === 'popover')
      adapted = adapted.replace(
        'richtext-z-50 richtext-w-72',
        'richtext-z-50 richtext-max-w-[calc(100vw-1rem)] richtext-max-h-[var(--radix-popover-content-available-height)] richtext-overflow-y-auto richtext-w-72'
      );
    if (item.name === 'dialog')
      adapted = adapted
        .replace(
          'richtext-flex richtext-flex-col richtext-fixed',
          'richtext-flex richtext-flex-col richtext-max-h-[calc(100dvh-2rem)] richtext-overflow-y-auto richtext-fixed'
        )
        .replace(
          'richtext-translate-y-[-50%] richtext-w-full',
          'richtext-translate-y-[-50%] richtext-w-[calc(100vw-2rem)]'
        );
    fs.writeFileSync(`src/components/reui/${item.name}.tsx`, adapted);
    manifest.push({
      component: item.name,
      revision,
      source: file.path,
      registry: `https://raw.githubusercontent.com/keenthemes/reui/${revision}/public/r/${item.name}.json`,
      sha256: crypto.createHash('sha256').update(file.content).digest('hex'),
    });
  }
}
const previous = only.length
  ? JSON.parse(fs.readFileSync('docs/reui/sources.json', 'utf8')).filter(
      (item) => !only.includes(item.component)
    )
  : [];
fs.writeFileSync(
  'docs/reui/sources.json',
  JSON.stringify([...previous, ...manifest], null, 2) + '\n'
);
