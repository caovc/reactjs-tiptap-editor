import { BubbleMenu } from '@tiptap/react/menus';
import { useCallback, useState } from 'react';

import { ActionButton } from '@/components/ActionButton';
import { Card } from '@/components/reui/card';
import { Twitter } from '@/extensions/Twitter';
import FormEditLinkTwitter from '@/extensions/Twitter/components/FormEditLinkTwitter';
import { useBubbleMenuOptions } from '@/hooks/useBubbleMenuOptions';
import { useLocale } from '@/locales';
import { useEditorInstance } from '@/store/editor';
import { useEditableEditor } from '@/store/store';
import { deleteNode } from '@/utils/delete-node';

import type { Editor } from '@tiptap/react';

export function RichTextBubbleTwitter() {
  const { t } = useLocale();
  const editable = useEditableEditor();
  const editor = useEditorInstance();
  const bubbleOptions = useBubbleMenuOptions(editor);

  const [showEdit, setShowEdit] = useState(false);

  const shouldShow = useCallback(({ editor }: { editor: Editor }) => {
    const isActive = editor.isActive(Twitter.name);
    return isActive;
  }, []);

  const onSetLink = (src: string) => {
    editor.commands.updateTweet({ src });
    setShowEdit(false);
  };

  const deleteMe = useCallback(() => deleteNode(Twitter.name, editor), [editor]);

  if (!editable) {
    return <></>;
  }

  return (
    <BubbleMenu
      editor={editor}
      appendTo={() => document.body}
      options={bubbleOptions}
      pluginKey={'RichTextBubbleTwitter'}
      shouldShow={shouldShow}
    >
      <>
        {showEdit ? (
          <Card
            data-richtext-portal
            className='richtext-bubble-surface richtext-flex-row richtext-items-center richtext-gap-2 richtext-p-4'
          >
            <FormEditLinkTwitter editor={editor} onSetLink={onSetLink} />
          </Card>
        ) : (
          <Card
            data-richtext-portal
            className='richtext-bubble-surface richtext-flex-row richtext-items-center richtext-gap-2 richtext-p-1'
          >
            <ActionButton
              icon='Pencil'
              tooltip={t('editor.link.edit.tooltip')}
              tooltipOptions={{ sideOffset: 15 }}
              action={() => {
                setShowEdit(true);
              }}
            />

            <ActionButton
              action={deleteMe}
              icon='Trash'
              tooltip={t('editor.delete')}
              tooltipOptions={{ sideOffset: 15 }}
            />
          </Card>
        )}
      </>
    </BubbleMenu>
  );
}
