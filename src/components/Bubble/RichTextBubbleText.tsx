import { TextSelection } from '@tiptap/pm/state';
import { useEditorState } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Check } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ActionButton } from '@/components';
import { IconComponent } from '@/components/icons';
import { Popover, PopoverContent, PopoverTrigger, Separator } from '@/components/reui';
import { Button as ReuiButton } from '@/components/reui/button';
import { Card } from '@/components/reui/card';
import { aiPluginKey } from '@/extensions/AI/state';
import { RichTextBold } from '@/extensions/Bold';
import { RichTextCode } from '@/extensions/Code';
import { RichTextColor } from '@/extensions/Color';
import { RichTextHighlight } from '@/extensions/Highlight';
import { RichTextItalic } from '@/extensions/Italic';
import { RichTextLink } from '@/extensions/Link';
import { renderCommandListDefault } from '@/extensions/SlashCommand';
import { RichTextStrike } from '@/extensions/Strike';
import { RichTextAlign } from '@/extensions/TextAlign';
import { RichTextUnderline } from '@/extensions/TextUnderline';
import { useBubbleMenuOptions } from '@/hooks/useBubbleMenuOptions';
import { useLocale } from '@/locales';
import { useEditorInstance } from '@/store/editor';
import { useEditableEditor } from '@/store/store';

import { RichTextAIImprove } from './RichTextAIImprove';

import type { Editor } from '@tiptap/react';

interface RichTextBubbleTextProps {
  buttonBubble?: React.ReactNode;
}

// export const BUBBLE_TEXT_LIST = [
//   'bold',
//   'italic',
//   'underline',
//   'strike',
//   'code',
//   'link',
//   'color',
//   'highlight',
//   'textAlign',
// ];

function ParagraphFormat() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  const editor = useEditorInstance();
  const items = useMemo(() => {
    return renderCommandListDefault({ t })?.[0]?.commands;
  }, [t]);

  const activeItems = useEditorState({
    editor,
    selector: () => items?.map((item) => !!item?.isActive?.(editor)),
  });
  const label = items?.find((_, index) => activeItems?.[index])?.label;

  return (
    <Popover modal onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        asChild
        className='hover:richtext-bg-accent data-[state=on]:richtext-bg-accent'
      >
        <ActionButton dataState={!!label}>
          {label ? <>{label}</> : <>{t('editor.paragraph.tooltip')}</>}

          <IconComponent
            className='richtext-ml-1 richtext-size-3 richtext-text-zinc-500'
            name='MenuDown'
          />
        </ActionButton>
      </PopoverTrigger>

      <PopoverContent
        align='start'
        className='!richtext-w-[initial] !richtext-p-[4px]'
        hideWhenDetached
        side='bottom'
      >
        {items?.map((item, index) => {
          const isActive = activeItems?.[index];

          return (
            <ReuiButton
              type='button'
              variant='ghost'
              size='sm'
              className='richtext-flex richtext-h-auto richtext-w-full richtext-items-center richtext-justify-start richtext-gap-3 richtext-rounded-sm richtext-px-2 richtext-py-1.5 richtext-text-left richtext-text-sm richtext-text-foreground richtext-transition-colors hover:!richtext-bg-accent'
              key={item.name}
              onClick={(e) => {
                e.preventDefault();
                item.action({
                  editor,
                  range: {
                    from: editor.state.selection.from,
                    to: editor.state.selection.to,
                  },
                });
                setOpen(false);
              }}
            >
              <div className='!richtext-min-w-[20px]'>
                {isActive && <Check size={16} />}
                {!label && item.label === t('editor.paragraph.tooltip') && !isActive && (
                  <Check size={16} />
                )}
              </div>

              <div className='richtext-flex richtext-items-center richtext-gap-1'>
                {item.iconName && (
                  <IconComponent
                    className='!richtext-mr-1 !richtext-text-lg'
                    name={item.iconName}
                  />
                )}

                {item.label}
              </div>
            </ReuiButton>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

function DefaultButtonBubble() {
  return (
    <>
      <RichTextAIImprove />
      <ParagraphFormat />

      <Separator
        className='!richtext-mx-1 !richtext-my-2 !richtext-h-[16px]'
        orientation='vertical'
      />

      <RichTextBold />
      <RichTextItalic />
      <RichTextUnderline />
      <RichTextStrike />
      <RichTextCode />
      <RichTextLink />

      <Separator
        className='!richtext-mx-1 !richtext-my-2 !richtext-h-[16px]'
        orientation='vertical'
      />

      <RichTextColor />
      <RichTextHighlight />
      <RichTextAlign />
    </>
  );
}

export function RichTextBubbleText({ buttonBubble }: RichTextBubbleTextProps) {
  const editor = useEditorInstance();
  const bubbleOptions = useBubbleMenuOptions(editor);
  const editable = useEditableEditor();

  const shouldShow = ({ editor }: { editor: Editor }) => {
    if (aiPluginKey.getState(editor.state)) return false;
    const { selection } = editor.view.state;
    const { $from, to } = selection;

    // not show code block bubble when selection is in code block
    if (editor.isActive('codeBlock')) {
      return false;
    }

    // check content select length is not empty
    if ($from.pos === to) {
      return false;
    }

    return selection instanceof TextSelection;
  };

  if (!editable) {
    return <></>;
  }

  return (
    <BubbleMenu
      editor={editor}
      appendTo={() => document.body}
      className='richtext-selection-bubble'
      data-richtext-portal
      options={bubbleOptions}
      pluginKey={'RichTextBubbleText'}
      shouldShow={shouldShow}
    >
      {buttonBubble ? (
        <>{buttonBubble}</>
      ) : (
        <Card
          role='toolbar'
          aria-label='Text formatting'
          data-richtext-portal
          className='richtext-bubble-surface richtext-flex richtext-flex-row richtext-items-center richtext-gap-2 richtext-p-1'
        >
          <DefaultButtonBubble />
        </Card>
      )}
    </BubbleMenu>
  );
}
