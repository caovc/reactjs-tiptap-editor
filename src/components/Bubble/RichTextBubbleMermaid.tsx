import { BubbleMenu } from '@tiptap/react/menus';
import { Fragment, useMemo } from 'react';

import { Separator } from '@/components';
import { getBubbleMermaid } from '@/components/Bubble/formatBubble';
import { Card } from '@/components/reui/card';
import { Mermaid } from '@/extensions/Mermaid';
import { EditMermaidBlock } from '@/extensions/Mermaid/components/EditMermaidBlock';
import { useAttributes } from '@/hooks/useAttributes';
import { useBubbleMenuOptions } from '@/hooks/useBubbleMenuOptions';
import { useExtension } from '@/hooks/useExtension';
import { useLocale } from '@/locales';
import { useEditorInstance } from '@/store/editor';
import { useEditableEditor } from '@/store/store';

import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/react';

function ItemA({
  item,
  disabled,
  editor,
}: {
  item: import('./formatBubble').BubbleMenuItem;
  disabled?: boolean;
  editor: Editor;
}) {
  const Comp = item.component;

  if (!Comp) {
    return <></>;
  }

  return (
    <Fragment>
      {item.type === 'divider' ? (
        <Separator
          className='!richtext-mx-1 !richtext-my-2 !richtext-h-[16px]'
          orientation='vertical'
        />
      ) : (
        <Comp
          {...item.componentProps}
          disabled={disabled || item?.componentProps?.disabled}
          editor={editor}
        />
      )}
    </Fragment>
  );
}

function isMermaidNode(node: ProseMirrorNode) {
  return node.type.name === Mermaid.name;
}

export function RichTextBubbleMermaid() {
  const { lang, t } = useLocale();
  const editable = useEditableEditor();
  const editor = useEditorInstance();
  const bubbleOptions = useBubbleMenuOptions(editor);

  const attrs = useAttributes<{
    src: string;
    alt: string;
    align: 'left' | 'center' | 'right';
  }>(editor, Mermaid.name);

  const extension = useExtension(Mermaid.name);

  const shouldShow = ({ editor }: { editor: Editor }) => {
    const { selection } = editor.view.state;
    const { $from, to } = selection;
    let isMermaid = false;

    editor.view.state.doc.nodesBetween($from.pos, to, (node: ProseMirrorNode) => {
      if (isMermaidNode(node)) {
        isMermaid = true;
        return false; // Stop iteration if an mermaid is found
      }
    });

    return isMermaid;
  };

  const items = useMemo(() => {
    return getBubbleMermaid(editor, t);
  }, [editor, lang, t]);

  if (!editable) {
    return <></>;
  }

  return (
    <BubbleMenu
      editor={editor}
      appendTo={() => document.body}
      options={bubbleOptions}
      pluginKey={'RichTextBubbleMermaid'}
      shouldShow={shouldShow}
    >
      {items?.length ? (
        <Card
          data-richtext-portal
          className='richtext-bubble-surface richtext-flex-row richtext-items-center richtext-gap-2 richtext-p-1'
        >
          {items?.map((item, key) => {
            if (item.type === 'edit' && attrs?.src) {
              return (
                <EditMermaidBlock
                  attrs={attrs}
                  editor={editor}
                  extension={extension}
                  key={`bubbleMenu-mermaid-${key}`}
                />
              );
            }

            return <ItemA editor={editor} item={item} key={`bubbleMenu-mermaid-${key}`} />;
          })}
        </Card>
      ) : (
        <></>
      )}
    </BubbleMenu>
  );
}
