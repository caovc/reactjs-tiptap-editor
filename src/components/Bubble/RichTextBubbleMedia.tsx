import { BubbleMenu } from '@tiptap/react/menus';
import { Fragment, useMemo } from 'react';

import { Separator } from '@/components';
import {
  getBubbleImage,
  getBubbleImageGif,
  getBubbleVideo,
} from '@/components/Bubble/formatBubble';
import { Card } from '@/components/reui/card';
import { Image, ImageBlock } from '@/extensions/Image';
import { ImageGif } from '@/extensions/ImageGif';
import { Video } from '@/extensions/Video';
import { useBubbleMenuOptions } from '@/hooks/useBubbleMenuOptions';
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
          disabled={disabled || item?.componentProps.disabled}
          editor={editor}
        />
      )}
    </Fragment>
  );
}

function isImageNode(node: ProseMirrorNode) {
  return node.type.name === Image.name || node.type.name === ImageBlock.name;
}

function isImageGifNode(node: ProseMirrorNode) {
  return node.type.name === ImageGif.name;
}

function isVideoNode(node: ProseMirrorNode) {
  return node.type.name === Video.name;
}

function RichTextBubbleImage() {
  const { lang, t } = useLocale();
  const editable = useEditableEditor();
  const editor = useEditorInstance();
  const bubbleOptions = useBubbleMenuOptions(editor);

  const shouldShow = ({ editor }: { editor: Editor }) => {
    const { selection } = editor.view.state;
    const { $from, to } = selection;
    let isImage = false;

    editor.view.state.doc.nodesBetween($from.pos, to, (node: ProseMirrorNode) => {
      if (isImageNode(node)) {
        isImage = true;
        return false; // Stop iteration if an image is found
      }
    });

    return isImage;
  };

  const items = useMemo(() => {
    return getBubbleImage(editor, t);
  }, [editor, lang, t]);

  if (!editable) {
    return <></>;
  }

  return (
    <BubbleMenu
      editor={editor}
      appendTo={() => document.body}
      options={bubbleOptions}
      pluginKey={'RichTextBubbleImage'}
      shouldShow={shouldShow}
    >
      {items?.length ? (
        <Card
          data-richtext-portal
          className='richtext-bubble-surface richtext-flex-row richtext-items-center richtext-gap-2 richtext-p-1'
        >
          {items?.map((item, key) => {
            return <ItemA editor={editor} item={item} key={`bubbleMenu-image-${key}`} />;
          })}
        </Card>
      ) : (
        <></>
      )}
    </BubbleMenu>
  );
}

function RichTextBubbleImageGif() {
  const { lang, t } = useLocale();
  const editable = useEditableEditor();
  const editor = useEditorInstance();
  const bubbleOptions = useBubbleMenuOptions(editor);

  const shouldShow = ({ editor }: { editor: Editor }) => {
    const { selection } = editor.view.state;
    const { $from, to } = selection;
    let isImage = false;

    editor.view.state.doc.nodesBetween($from.pos, to, (node: ProseMirrorNode) => {
      if (isImageGifNode(node)) {
        isImage = true;
        return false; // Stop iteration if an image is found
      }
    });

    return isImage;
  };

  const items = useMemo(() => {
    return getBubbleImageGif(editor, t);
  }, [editor, t, lang]);

  if (!editable) {
    return <></>;
  }

  return (
    <BubbleMenu
      editor={editor}
      appendTo={() => document.body}
      options={bubbleOptions}
      pluginKey={'RichTextBubbleImageGif'}
      shouldShow={shouldShow}
    >
      {items?.length ? (
        <Card
          data-richtext-portal
          className='richtext-bubble-surface richtext-flex-row richtext-items-center richtext-gap-2 richtext-p-1'
        >
          {items?.map((item, key) => {
            return <ItemA editor={editor} item={item} key={`bubbleMenu-image-gif-${key}`} />;
          })}
        </Card>
      ) : (
        <></>
      )}
    </BubbleMenu>
  );
}

function RichTextBubbleVideo() {
  const { t } = useLocale();
  const editable = useEditableEditor();
  const editor = useEditorInstance();
  const bubbleOptions = useBubbleMenuOptions(editor);

  const shouldShow = ({ editor }: { editor: Editor }) => {
    const { selection } = editor.view.state;
    const { $from, to } = selection;
    let isVideo = false;

    editor.view.state.doc.nodesBetween($from.pos, to, (node: ProseMirrorNode) => {
      if (isVideoNode(node)) {
        isVideo = true;
        return false;
      }
    });

    return isVideo;
  };

  const items = useMemo(() => {
    return getBubbleVideo(editor, t);
  }, [editor, t]);

  if (!editable) {
    return <></>;
  }

  return (
    <BubbleMenu
      editor={editor}
      appendTo={() => document.body}
      options={bubbleOptions}
      pluginKey={'RichTextBubbleVideo'}
      shouldShow={shouldShow}
    >
      {items?.length ? (
        <Card
          data-richtext-portal
          className='richtext-bubble-surface richtext-flex-row richtext-items-center richtext-gap-2 richtext-p-1'
        >
          {items?.map((item, key) => {
            return <ItemA editor={editor} item={item} key={`bubbleMenu-video-${key}`} />;
          })}
        </Card>
      ) : (
        <></>
      )}
    </BubbleMenu>
  );
}

export { RichTextBubbleImage, RichTextBubbleVideo, RichTextBubbleImageGif };
