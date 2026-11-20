import { BubbleMenu } from '@tiptap/react/menus';
import { useCallback, useEffect, useId, useState } from 'react';

import { ActionButton } from '@/components/ActionButton';
import { Button, Input, Label, Textarea } from '@/components/reui';
import { Card } from '@/components/reui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/reui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/reui/select';
import { Callout } from '@/extensions/Callout';
import { useAttributes } from '@/hooks/useAttributes';
import { useBubbleMenuOptions } from '@/hooks/useBubbleMenuOptions';
import { useLocale } from '@/locales';
import { useEditorInstance } from '@/store/editor';
import { useEditableEditor } from '@/store/store';
import { deleteNode } from '@/utils/delete-node';

const CALLOUT_TYPES = [
  { value: 'note', label: 'Note', icon: 'Info' },
  { value: 'tip', label: 'Tip', icon: 'Lightbulb' },
  { value: 'important', label: 'Important', icon: 'AlertCircle' },
  { value: 'warning', label: 'Warning', icon: 'TriangleAlert' },
  { value: 'caution', label: 'Caution', icon: 'OctagonAlert' },
] as const;

interface ICalloutAttrs {
  type?: string;
  title?: string;
  body?: string;
}

export function RichTextBubbleCallout() {
  const editable = useEditableEditor();
  const editor = useEditorInstance();
  const bubbleOptions = useBubbleMenuOptions(editor, 'top');
  const { t } = useLocale();

  const { type, title, body } = useAttributes<ICalloutAttrs>(editor, Callout.name, {
    type: 'note',
    title: '',
    body: '',
  });

  const id = useId();
  const [visible, setVisible] = useState(false);
  const [calloutType, setCalloutType] = useState('note');
  const [calloutTitle, setCalloutTitle] = useState('');
  const [calloutBody, setCalloutBody] = useState('');

  useEffect(() => {
    if (visible) {
      setCalloutType(type || 'note');
      setCalloutTitle(title || '');
      setCalloutBody(body || '');
    }
  }, [visible, type, title, body]);

  const handleUpdate = useCallback(() => {
    if (!editor) return;

    // Update attributes
    editor
      .chain()
      .updateAttributes(Callout.name, {
        type: calloutType,
        title: calloutTitle,
        body: calloutBody,
      })
      .focus()
      .run();

    setVisible(false);
  }, [editor, calloutType, calloutTitle, calloutBody]);

  const handleCancel = useCallback(() => {
    setVisible(false);
  }, []);

  const handleDelete = useCallback(() => {
    deleteNode(Callout.name, editor);
  }, [editor]);

  const shouldShow = useCallback(() => {
    return editor.isActive(Callout.name);
  }, [editor]);

  if (!editable) {
    return <></>;
  }

  return (
    <BubbleMenu
      editor={editor}
      appendTo={() => document.body}
      options={bubbleOptions}
      pluginKey='RichTextBubbleCallout'
      shouldShow={shouldShow}
    >
      <Card
        data-richtext-portal
        className='richtext-bubble-surface richtext-flex-row richtext-items-center richtext-gap-2 richtext-p-1'
      >
        <Dialog onOpenChange={setVisible} open={visible}>
          <DialogTrigger asChild>
            <ActionButton icon='Pencil' tooltip={t('editor.callout.edit.title')} />
          </DialogTrigger>

          <DialogContent>
            <DialogTitle>{t('editor.callout.edit.title')}</DialogTitle>

            <div className='richtext-space-y-4 richtext-py-4'>
              <div className='richtext-space-y-2'>
                <Label htmlFor={`${id}-type`}>{t('editor.callout.dialog.type')}</Label>

                <Select onValueChange={setCalloutType} value={calloutType}>
                  <SelectTrigger id={`${id}-type`}>
                    <SelectValue
                      className='richtext-text-accent'
                      placeholder={t('editor.callout.dialog.type.placeholder')}
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {CALLOUT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {t(`editor.callout.type.${type.value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='richtext-space-y-2'>
                <Label htmlFor={`${id}-title`}>{t('editor.callout.dialog.title.label')}</Label>

                <Input
                  id={`${id}-title`}
                  onChange={(e) => setCalloutTitle(e.currentTarget.value)}
                  placeholder={t('editor.callout.dialog.title.placeholder')}
                  type='text'
                  value={calloutTitle}
                />
              </div>

              <div className='richtext-space-y-2'>
                <Label htmlFor={`${id}-body`}>{t('editor.callout.dialog.body.label')}</Label>

                <Textarea
                  id={`${id}-body`}
                  onChange={(e) => setCalloutBody(e.currentTarget.value)}
                  placeholder={t('editor.callout.dialog.body.placeholder')}
                  value={calloutBody}
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleCancel} variant='outline'>
                {t('editor.callout.dialog.button.cancel')}
              </Button>

              <Button onClick={handleUpdate}>{t('editor.callout.dialog.button.apply')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ActionButton action={handleDelete} icon='Trash2' tooltip={t('editor.delete')} />
      </Card>
    </BubbleMenu>
  );
}
