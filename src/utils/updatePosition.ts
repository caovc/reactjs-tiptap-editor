import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { posToDOMRect } from '@tiptap/react';

import type { Editor } from '@tiptap/core';

export function updatePosition(editor: Editor, element: HTMLElement) {
  element.style.width = 'max-content';
  element.style.maxWidth = 'calc(100dvw - 16px)';
  const virtualElement = {
    contextElement: editor.view.dom,
    getBoundingClientRect: () =>
      posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to),
  };

  computePosition(virtualElement, element, {
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
  }).then(({ x, y, strategy }) => {
    element.style.width = 'max-content';
    element.style.position = strategy;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  });
}

/** Follow caret geometry through canvas scrolling, layout changes and CSS zoom. */
export function observePosition(editor: Editor, element: HTMLElement) {
  const reference = {
    contextElement: editor.view.dom,
    getBoundingClientRect: () =>
      posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to),
  };
  return autoUpdate(reference, element, () => updatePosition(editor, element), {
    animationFrame: true,
  });
}
