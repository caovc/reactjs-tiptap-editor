import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ruleTools from 'tailwindcss/lib/lib/generateRules.js';
import contextTools from 'tailwindcss/lib/lib/setupContextUtils.js';
import loadConfig from 'tailwindcss/loadConfig.js';
import resolveConfig from 'tailwindcss/resolveConfig.js';
import ts from 'typescript';

// This is a build-time contract for the locked Tailwind 3 compiler, not a
// second utility parser. Upgrading Tailwind must update this verifier too.
const root = fileURLToPath(new URL('../../', import.meta.url));
const context = contextTools.createContext(
  resolveConfig(loadConfig(path.join(root, 'tailwind.config.js')))
);
const supplied = process.argv.find((arg) => arg.startsWith('--source='));
const roots = supplied
  ? [path.resolve(supplied.slice('--source='.length))]
  : ['src', 'playground/src'].map((p) => path.join(root, p));
const candidates = new Map();
function inClasses(node) {
  for (let p = node.parent; p; p = p.parent) {
    if (ts.isJsxAttribute(p)) return /class(?:name|names)?$/i.test(p.name.getText());
    if (ts.isCallExpression(p) && ['cn', 'cva', 'clsx'].includes(p.expression.getText()))
      return true;
    if (ts.isPropertyAssignment(p) && /class(?:name|names)?$/i.test(p.name.getText())) return true;
    if (ts.isVariableDeclaration(p)) return /class/i.test(p.name.getText());
  }
  return false;
}
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.tsx?$/.test(file)) {
      const ast = ts.createSourceFile(
        file,
        fs.readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true
      );
      function visit(node) {
        if (
          (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
          inClasses(node)
        ) {
          for (const token of node.text.trim().split(/\s+/)) {
            if (!token.includes('richtext-')) continue;
            const files = candidates.get(token) ?? new Set();
            files.add(path.relative(root, file));
            candidates.set(token, files);
          }
        }
        ts.forEachChild(node, visit);
      }
      visit(ast);
    }
  }
}
roots.forEach(walk);
const styleFiles = [];
function styles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) styles(file);
    else if (/\.(scss|css)$/.test(file)) styleFiles.push(file);
  }
}
styles(path.join(root, 'src'));
styles(path.join(root, 'playground/src'));
const authoredStyles = styleFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
// These are semantic/test/third-party selector anchors, not utility claims.
// Exact tokens and exact owners only: a new plugin cannot exempt itself.
const markers = {
  'richtext-tooltip': ['src/components/ActionButton.tsx'],
  'richtext-ai-improve-anchor': ['src/components/Bubble/RichTextAIImprove.tsx'],
  'richtext-recent-highlight': ['src/components/ColorPicker.tsx'],
  'richtext-recent-colors': ['src/components/ColorPicker.tsx'],
  'richtext-toaster': ['src/components/reui/sonner.tsx'],
  'richtext-toast': ['src/components/reui/sonner.tsx'],
  'richtext-ai-insertion': ['src/extensions/AI/AIPanel.tsx'],
  'richtext-ai-loading-label': ['src/extensions/AI/AIPanel.tsx'],
  'richtext-ai-review': ['src/extensions/AI/AIPanel.tsx'],
  'richtext-ai-send': ['src/extensions/AI/AIPanel.tsx'],
  'richtext-ai-apply': ['src/extensions/AI/AIPanel.tsx'],
};
const unsupported = [],
  generated = [],
  semantic = [];
for (const [token, files] of candidates) {
  if (ruleTools.generateRules(new Set([token]), context).length) {
    generated.push(token);
    continue;
  }
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const declared = new RegExp(`\\.${escaped}(?![\\w-])`).test(authoredStyles);
  const marker =
    token === 'richtext-group' ||
    token === 'richtext-peer' ||
    [...files].every((file) => markers[token]?.includes(file));
  if (declared || marker)
    semantic.push({
      token,
      files: [...files],
      reason: declared ? 'authored CSS selector' : 'exact semantic/group/peer anchor',
    });
  else unsupported.push({ token, files: [...files] });
}
const report = {
  compiler: 'Tailwind 3 (locked dependency)',
  literalCandidates: candidates.size,
  generatedUtilities: generated.length,
  semantic,
  unsupported,
};
if (!supplied)
  fs.writeFileSync(
    path.join(root, 'docs/reui/full-audit/utility-current.json'),
    JSON.stringify(report, null, 2) + '\n'
  );
console.log(JSON.stringify(report, null, 2));
if (unsupported.length) process.exitCode = 1;
