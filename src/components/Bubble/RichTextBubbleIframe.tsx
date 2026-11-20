import { BubbleMenu } from '@tiptap/react/menus';
import { useCallback, useEffect, useState } from 'react';

import { ActionButton } from '@/components/ActionButton';
import { Button, Input } from '@/components/reui';
import { Card } from '@/components/reui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/reui/dialog';
import { SizeSetter } from '@/components/SizeSetter/SizeSetter';
import { Iframe } from '@/extensions/Iframe';
import { getServiceSrc } from '@/extensions/Iframe/utils';
import { useAttributes } from '@/hooks/useAttributes';
import { useBubbleMenuOptions } from '@/hooks/useBubbleMenuOptions';
import { useLocale } from '@/locales';
import { useEditorInstance } from '@/store/editor';
import { useEditableEditor } from '@/store/store';
import { deleteNode } from '@/utils/delete-node';

interface IIframeAttrs {
  width?: number | string;
  height?: number;
  src?: string;
  defaultShowPicker?: boolean;
}

export function RichTextBubbleIframe() {
  const editable = useEditableEditor();
  const editor = useEditorInstance();
  const bubbleOptions = useBubbleMenuOptions(editor);

  const { t } = useLocale();
  const { width, height, src } = useAttributes<IIframeAttrs>(editor, Iframe.name, {
    width: 0,
    height: 0,
    src: '',
    defaultShowPicker: false,
  });
  const [visible, toggleVisible] = useState(false);
  const [formUrl, setFormUrl] = useState('');

  const handleCancel = useCallback(
    (e: React.SyntheticEvent) => {
      e?.preventDefault?.();

      toggleVisible(false);
    },
    [toggleVisible]
  );

  useEffect(() => {
    if (visible) setFormUrl(src ?? '');
  }, [visible, src]);

  const handleOk = useCallback(
    (e: React.SyntheticEvent) => {
      e?.preventDefault?.();

      const urlFormat = getServiceSrc(formUrl);

      editor
        .chain()
        .updateAttributes(Iframe.name, {
          src: (typeof urlFormat === 'string' ? urlFormat : urlFormat.src) || formUrl,
        })
        .setNodeSelection(editor.state.selection.from)
        .focus()
        .run();
      toggleVisible(false);
    },
    [editor, formUrl, toggleVisible]
  );

  const visitLink = useCallback(() => {
    window.open(src, '_blank');
  }, [src]);

  const setSize = useCallback(
    (size: { width: number | string; height: number | string }) => {
      editor
        .chain()
        .updateAttributes(Iframe.name, size)
        .setNodeSelection(editor.state.selection.from)
        .focus()
        .run();
    },
    [editor]
  );

  const shouldShow = useCallback(() => editor.isActive(Iframe.name) && !src, [editor, src]);

  const deleteMe = useCallback(() => deleteNode(Iframe.name, editor), [editor]);

  if (!editable) {
    return <></>;
  }

  return (
    <>
      <BubbleMenu
        editor={editor}
        appendTo={() => document.body}
        options={bubbleOptions}
        pluginKey={'RichTextBubbleIframe'}
        shouldShow={shouldShow}
      >
        <Card
          data-richtext-portal
          className='richtext-bubble-surface richtext-flex-row richtext-items-center richtext-gap-2 richtext-p-1'
        >
          <ActionButton action={visitLink} icon='Eye' tooltip='Visit Link' />

          <Dialog onOpenChange={toggleVisible} open={visible}>
            <DialogTrigger asChild>
              <ActionButton icon='Pencil' tooltip='Open Edit Link' />
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Link Iframe</DialogTitle>
              </DialogHeader>

              <Input
                autoFocus
                onInput={(e) => setFormUrl(e.currentTarget.value)}
                placeholder='Enter link'
                type='url'
                value={formUrl}
              />

              <DialogFooter>
                <Button onClick={handleCancel} type='button'>
                  Cancel
                </Button>

                <Button onClick={handleOk} type='button'>
                  OK
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <SizeSetter height={height} onOk={setSize} width={width}>
            <ActionButton icon='Settings' tooltip={t('editor.settings')} />
          </SizeSetter>

          <ActionButton action={deleteMe} icon='Trash2' tooltip={t('editor.delete')} />
        </Card>
      </BubbleMenu>
    </>
  );
}
