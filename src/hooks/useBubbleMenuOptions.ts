import { getOverflowAncestors } from '@floating-ui/dom';
import { useEffect, useMemo, useState, type ComponentProps } from 'react';

import type { Editor } from '@tiptap/core';
import type { BubbleMenu } from '@tiptap/react/menus';

type Options = NonNullable<ComponentProps<typeof BubbleMenu>['options']>;

/** Body portals use viewport coordinates; observe the editor's actual scrollport. */
export function useBubbleMenuOptions(editor: Editor, placement: Options['placement'] = 'bottom') {
  const [scrollTarget, setScrollTarget] = useState<HTMLElement | Window>();
  useEffect(() => {
    const scrollport = getOverflowAncestors(editor.view.dom).find(
      (ancestor) => ancestor instanceof HTMLElement
    );
    setScrollTarget(scrollport ?? window);
  }, [editor]);
  return useMemo(
    () =>
      ({
        strategy: 'fixed',
        placement,
        offset: 8,
        flip: { padding: 8 },
        shift: { padding: 8 },
        scrollTarget,
      }) satisfies Options,
    [placement, scrollTarget]
  );
}
