import { useEffect } from 'react';

import { THEME, useTheme } from '@/theme/theme';
import { removeCSS, updateCSS } from '@/utils/dynamicCSS';

export function ThemeColorReactive() {
  const { theme, color, borderRadius } = useTheme();

  // Tokens alone cannot activate dark: state variants in a body portal.
  // Publish the class only to opted-in editor boundaries, never html/body.
  useEffect(() => {
    const isDark = theme === 'dark';
    const syncBoundary = (element: Element) => {
      if (
        element.matches('[data-richtext-portal]') &&
        element.classList.contains('dark') !== isDark
      )
        element.classList.toggle('dark', isDark);
    };
    const syncTree = (element: Element) => {
      syncBoundary(element);
      element.querySelectorAll('[data-richtext-portal]').forEach(syncBoundary);
    };
    syncTree(document.body);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'attributes' && record.target instanceof Element) {
          if (record.attributeName === 'class') syncBoundary(record.target);
          else syncTree(record.target);
        }
        for (const node of record.addedNodes) if (node instanceof Element) syncTree(node);
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-richtext-portal', 'class'],
    });
    return () => observer.disconnect();
  }, [theme]);

  useEffect(() => {
    const themeValue = theme || 'light';
    const colorValue = color || 'default';

    const themes: Record<string, Record<string, Record<string, string>>> = THEME;
    let themeObject = themes[themeValue]?.[colorValue];

    if (!themeObject) {
      themeObject = THEME['light']['default'];
      return;
    }

    updateCSS(
      `
      .reactjs-tiptap-editor, .reactjs-tiptap-editor *,
      .reactjs-tiptap-editor-theme, .reactjs-tiptap-editor-theme *,
      [data-richtext-portal], [data-richtext-portal] * {
        ${Object.entries(themeObject)
          .map(([key, value]) => {
            if (typeof borderRadius === 'string' && key === 'radius') {
              return `--${key}: ${borderRadius};`;
            }

            return `--${key}: ${value};`;
          })
          .join('\n')}
      }
      `,
      'richtext-theme',
      {
        priority: 50,
      }
    );

    return () => {
      removeCSS('richtext-theme');
    };
  }, [theme, color, borderRadius]);

  return <></>;
}
