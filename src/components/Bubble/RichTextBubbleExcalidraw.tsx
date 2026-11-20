import { BubbleMenu } from '@tiptap/react/menus';
import { useCallback, useEffect } from 'react';

import { ActionButton } from '@/components/ActionButton';
import { emit } from '@/components/ReactBus';
import { Card } from '@/components/reui/card';
import { SizeSetter } from '@/components/SizeSetter/SizeSetter';
import { Excalidraw } from '@/extensions/Excalidraw';
import { useAttributes } from '@/hooks/useAttributes';
import { useBubbleMenuOptions } from '@/hooks/useBubbleMenuOptions';
import { useLocale } from '@/locales';
import { useEditorInstance } from '@/store/editor';
import { useEditableEditor } from '@/store/store';
import { EVENTS } from '@/utils/customEvents/events.constant';
import { deleteNode } from '@/utils/delete-node';
import { getEditorContainerDOMSize } from '@/utils/editor-container-size';

import type { IExcalidrawAttrs } from '@/extensions/Excalidraw';

export function RichTextBubbleExcalidraw() {
  const editable = useEditableEditor();
  const editor = useEditorInstance();
  const bubbleOptions = useBubbleMenuOptions(editor);

  const { t } = useLocale();
  const { width: maxWidth } = getEditorContainerDOMSize(editor);
  const attrs = useAttributes<IExcalidrawAttrs>(editor, Excalidraw.name, {
    defaultShowPicker: false,
    createUser: '',
    width: 0,
    height: 0,
  });
  const { defaultShowPicker, createUser, width, height } = attrs;

  const setSize = useCallback(
    (size: { width: number | string; height: number | string }) => {
      editor
        .chain()
        .updateAttributes(Excalidraw.name, size)
        .setNodeSelection(editor.state.selection.from)
        .focus()
        .run();
    },
    [editor]
  );

  const openEditLinkModal = useCallback(() => {
    const EVENT_ID = EVENTS.EXCALIDRAW(editor.id);
    emit(EVENT_ID, attrs);
  }, [editor, attrs]);

  const shouldShow = useCallback(() => editor.isActive(Excalidraw.name), [editor]);
  const deleteMe = useCallback(() => deleteNode(Excalidraw.name, editor), [editor]);

  useEffect(() => {
    if (defaultShowPicker) {
      openEditLinkModal();
      editor.chain().updateAttributes(Excalidraw.name, { defaultShowPicker: false }).focus().run();
    }
  }, [createUser, defaultShowPicker, editor, openEditLinkModal]);

  if (!editable) {
    return <></>;
  }

  return (
    <BubbleMenu
      editor={editor}
      appendTo={() => document.body}
      options={bubbleOptions}
      pluginKey={'RichTextBubbleExcalidraw'}
      shouldShow={shouldShow}
    >
      <Card
        data-richtext-portal
        className='richtext-bubble-surface richtext-flex-row richtext-items-center richtext-gap-2 richtext-p-1'
      >
        <ActionButton action={openEditLinkModal} icon='Pencil' tooltip={t('editor.edit')} />

        <SizeSetter height={height} maxWidth={maxWidth} onOk={setSize} width={width}>
          <ActionButton icon='Settings' tooltip={t('editor.settings')} />
        </SizeSetter>

        <ActionButton action={deleteMe} icon='Trash2' tooltip={t('editor.delete')} />
      </Card>
    </BubbleMenu>
  );
}
