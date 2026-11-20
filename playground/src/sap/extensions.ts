import { Extension, Mark, mergeAttributes, type Editor } from '@tiptap/core';
import { closeHistory } from '@tiptap/pm/history';
import { Plugin } from '@tiptap/pm/state';

import type { Node as PMNode } from '@tiptap/pm/model';

export const SectionIdentity = Extension.create({
  name: 'sapSectionIdentity',
  addGlobalAttributes() {
    return [
      {
        types: ['heading'],
        attributes: {
          sapId: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-sap-id'),
            renderHTML: (attrs) =>
              attrs.sapId ? { 'data-sap-id': attrs.sapId, id: attrs.sapId } : {},
          },
          sectionNumber: {
            default: '',
            parseHTML: () => '',
            renderHTML: (attrs) => ({ 'data-section-number': attrs.sectionNumber }),
          },
        },
      },
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction(transactions, _old, state) {
          if (!transactions.some((tr) => tr.docChanged || tr.getMeta('sap-init'))) return null;
          const tr = state.tr;
          const used = new Set<string>();
          const counts = [0, 0, 0];
          state.doc.descendants((node, pos) => {
            if (node.type.name !== 'heading') return;
            const level = Math.min(3, Math.max(1, Number(node.attrs.level)));
            for (let parent = 0; parent < level - 1; parent++)
              if (counts[parent] === 0) counts[parent] = 1;
            counts[level - 1] += 1;
            for (let i = level; i < 3; i++) counts[i] = 0;
            const number = counts.slice(0, level).join('.');
            let id = typeof node.attrs.sapId === 'string' ? node.attrs.sapId : '';
            if (!/^sap-[a-zA-Z0-9-]{1,80}$/.test(id) || used.has(id))
              id = `sap-${crypto.randomUUID()}`;
            used.add(id);
            if (id !== node.attrs.sapId || number !== node.attrs.sectionNumber)
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, sapId: id, sectionNumber: number });
          });
          return tr.docChanged ? tr.setMeta('addToHistory', false) : null;
        },
      }),
    ];
  },
});
export const SapComment = Mark.create({
  name: 'sapComment',
  inclusive: false,
  addAttributes() {
    return {
      id: { default: null, parseHTML: (element) => element.getAttribute('data-comment-id') },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-comment-id]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes({ class: 'sap-comment', 'data-comment-id': HTMLAttributes.id }),
      0,
    ];
  },
});
export type OutlineItem = { id: string; pos: number; level: number; number: string; text: string };
export function getOutline(doc: PMNode): OutlineItem[] {
  const items: OutlineItem[] = [];
  doc.descendants((node, pos) => {
    if (node.type.name === 'heading')
      items.push({
        id: node.attrs.sapId || `position-${pos}`,
        pos,
        level: node.attrs.level,
        number: node.attrs.sectionNumber || '',
        text: node.textContent || '未命名章节',
      });
  });
  return items;
}
export function commentAnchor(doc: PMNode, id: string) {
  let from = -1,
    to = -1,
    text = '';
  doc.descendants((node, pos) => {
    if (
      node.isText &&
      node.marks.some((mark) => mark.type.name === 'sapComment' && mark.attrs.id === id)
    ) {
      if (from === -1) from = pos;
      to = pos + node.nodeSize;
      text += node.text || '';
    }
  });
  return from === -1 ? null : { from, to, text };
}
export function findMatches(doc: PMNode, query: string) {
  const matches: { from: number; to: number }[] = [];
  if (!query.trim()) return matches;
  const needle = query.toLocaleLowerCase();
  doc.descendants((node, pos) => {
    if (!node.isTextblock) return;
    const text = node.textBetween(0, node.content.size, undefined, '\uFFFC').toLocaleLowerCase();
    let index = text.indexOf(needle);
    while (index >= 0 && matches.length < 2000) {
      matches.push({ from: pos + 1 + index, to: pos + 1 + index + query.length });
      index = text.indexOf(needle, index + query.length);
    }
    return false;
  });
  return matches;
}
export function isolateHistory(editor: Editor | null, run: () => void) {
  if (editor) editor.view.dispatch(closeHistory(editor.state.tr));
  run();
  if (editor && !editor.isDestroyed) editor.view.dispatch(closeHistory(editor.state.tr));
}
export function jumpTo(editor: Editor, from: number, to = from) {
  editor.view.dispatch(closeHistory(editor.state.tr));
  editor.chain().setTextSelection({ from, to }).scrollIntoView().run();
  // Tiptap focus() queues a frame; navigation must publish the new DOM
  // selection before the very next input, not restore the previous caret.
  editor.view.focus();
}
