// Base Kit
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { ListItem } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { TextStyle } from '@tiptap/extension-text-style';
import { Dropcursor, Gapcursor, Placeholder, TrailingNode } from '@tiptap/extensions';
// import Collaboration from '@tiptap/extension-collaboration'
// import CollaborationCaret from '@tiptap/extension-collaboration-caret'
// import { HocuspocusProvider } from '@hocuspocus/provider'
// import * as Y from 'yjs'
import { EditorContent, useEditor } from '@tiptap/react';
// const hocuspocusProvider = new HocuspocusProvider({
//   url: 'ws://0.0.0.0:8080',
//   name: 'github.com/hunghg255',
//   document: ydoc,
// })
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { RichTextProvider } from 'reactjs-tiptap-editor';
import { AI } from 'reactjs-tiptap-editor/ai';
import { Attachment, RichTextAttachment } from 'reactjs-tiptap-editor/attachment';
import { Blockquote, RichTextBlockquote } from 'reactjs-tiptap-editor/blockquote';
import { Bold, RichTextBold } from 'reactjs-tiptap-editor/bold';
// Bubble
import {
  RichTextBubbleCallout,
  RichTextBubbleColumns,
  RichTextBubbleDrawer,
  RichTextBubbleExcalidraw,
  RichTextBubbleIframe,
  RichTextBubbleKatex,
  RichTextBubbleLink,
  RichTextBubbleImage,
  RichTextBubbleVideo,
  RichTextBubbleImageGif,
  RichTextBubbleMermaid,
  RichTextBubbleTable,
  RichTextBubbleText,
  RichTextBubbleTwitter,
  RichTextBubbleMenuDragHandle,
  RichTextBubbleCodeBlock,
} from 'reactjs-tiptap-editor/bubble';
import { BulletList, RichTextBulletList } from 'reactjs-tiptap-editor/bulletlist';
import { Callout, RichTextCallout } from 'reactjs-tiptap-editor/callout';
import { Clear, RichTextClear } from 'reactjs-tiptap-editor/clear';
import { Code, RichTextCode } from 'reactjs-tiptap-editor/code';
import { CodeBlock, RichTextCodeBlock } from 'reactjs-tiptap-editor/codeblock';
import { CodeView, RichTextCodeView } from 'reactjs-tiptap-editor/codeview';
import { Color, RichTextColor } from 'reactjs-tiptap-editor/color';
import {
  Column,
  ColumnNode,
  MultipleColumnNode,
  RichTextColumn,
} from 'reactjs-tiptap-editor/column';
import { Details, RichTextDetails } from 'reactjs-tiptap-editor/details';
import { Drawer, RichTextDrawer } from 'reactjs-tiptap-editor/drawer';
import { Emoji, RichTextEmoji } from 'reactjs-tiptap-editor/emoji';
import { Excalidraw, RichTextExcalidraw } from 'reactjs-tiptap-editor/excalidraw';
import { ExportMarkdown, RichTextExportMarkdown } from 'reactjs-tiptap-editor/exportmarkdown';
import { ExportPdf, RichTextExportPdf } from 'reactjs-tiptap-editor/exportpdf';
import { ExportWord, RichTextExportWord } from 'reactjs-tiptap-editor/exportword';
import { FontFamily, RichTextFontFamily } from 'reactjs-tiptap-editor/fontfamily';
import { FontSize, RichTextFontSize } from 'reactjs-tiptap-editor/fontsize';
import { FormatPainter, RichTextFormatPainter } from 'reactjs-tiptap-editor/formatpainter';
import { Heading, RichTextHeading } from 'reactjs-tiptap-editor/heading';
import { Highlight, RichTextHighlight } from 'reactjs-tiptap-editor/highlight';
// build extensions
import { History, RichTextUndo, RichTextRedo } from 'reactjs-tiptap-editor/history';
import { HorizontalRule, RichTextHorizontalRule } from 'reactjs-tiptap-editor/horizontalrule';
import { Iframe, RichTextIframe } from 'reactjs-tiptap-editor/iframe';
import { Image, RichTextImage } from 'reactjs-tiptap-editor/image';
import { ImageGif, RichTextImageGif } from 'reactjs-tiptap-editor/imagegif';
import { ImportWord, RichTextImportWord } from 'reactjs-tiptap-editor/importword';
import { Indent, RichTextIndent } from 'reactjs-tiptap-editor/indent';
import { Italic, RichTextItalic } from 'reactjs-tiptap-editor/italic';
import { Katex, RichTextKatex } from 'reactjs-tiptap-editor/katex';
import { LineHeight, RichTextLineHeight } from 'reactjs-tiptap-editor/lineheight';
import { Link, RichTextLink } from 'reactjs-tiptap-editor/link';
import { localeActions, useLocale } from 'reactjs-tiptap-editor/locale-bundle';
import { MarkdownPaste } from 'reactjs-tiptap-editor/markdownpaste';
import { Mention } from 'reactjs-tiptap-editor/mention';
import { Mermaid, RichTextMermaid } from 'reactjs-tiptap-editor/mermaid';
import { MoreMark, RichTextMoreMark } from 'reactjs-tiptap-editor/moremark';
import { OrderedList, RichTextOrderedList } from 'reactjs-tiptap-editor/orderedlist';
import { SearchAndReplace, RichTextSearchAndReplace } from 'reactjs-tiptap-editor/searchandreplace';
import { ShortMessage } from 'reactjs-tiptap-editor/shortmessage';
import { SlashCommand, SlashCommandList } from 'reactjs-tiptap-editor/slashcommand';
import { Strike, RichTextStrike } from 'reactjs-tiptap-editor/strike';
import { Table, RichTextTable } from 'reactjs-tiptap-editor/table';
import { TableOfContents, RichTextTableOfContents } from 'reactjs-tiptap-editor/tableofcontents';
import { TaskList, RichTextTaskList } from 'reactjs-tiptap-editor/tasklist';
import { TextAlign, RichTextAlign } from 'reactjs-tiptap-editor/textalign';
import { TextDirection, RichTextTextDirection } from 'reactjs-tiptap-editor/textdirection';
import { TextUnderline, RichTextUnderline } from 'reactjs-tiptap-editor/textunderline';
import { themeActions, useTheme } from 'reactjs-tiptap-editor/theme';
import { Twitter, RichTextTwitter } from 'reactjs-tiptap-editor/twitter';
import { Video, RichTextVideo } from 'reactjs-tiptap-editor/video';

import { Button as ReuiButton } from '@/components/reui/button';
import { Card, CardHeader, CardContent } from '@/components/reui/card';
import { Slider, SliderThumb } from '@/components/reui/slider';
import { Textarea as ReuiTextarea } from '@/components/reui/textarea';
import { Toggle } from '@/components/reui/toggle';

import 'reactjs-tiptap-editor/style.css';
// const ydoc = new Y.Doc()
import 'katex/dist/katex.min.css';
import 'easydrawer/styles.css';
import '@excalidraw/excalidraw/index.css';

// This is only an example, all supported languages are already loaded above
// but you can also register only specific languages to reduce bundle-size

function convertBase64ToBlob(base64: string) {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// custom document to support columns
const DocumentColumn = /* @__PURE__ */ Document.extend({
  content: '(block|columns)+',
});

const MOCK_USERS = [
  {
    id: '0',
    label: 'hunghg255',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/42096908?v=4',
    },
  },
  {
    id: '1',
    label: 'benjamincanac',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/739984?v=4',
    },
  },
  {
    id: '2',
    label: 'atinux',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/904724?v=4',
    },
  },
  {
    id: '3',
    label: 'danielroe',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/28706372?v=4',
    },
  },
  {
    id: '4',
    label: 'pi0',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/5158436?v=4',
    },
  },
];

const BaseKit = [
  DocumentColumn,
  Text,
  Dropcursor.configure({
    class: 'reactjs-tiptap-editor-theme',
    color: 'hsl(var(--primary))',
    width: 2,
  }),
  Gapcursor,
  HardBreak,
  Paragraph,
  TrailingNode,
  ListItem,
  TextStyle,
  Placeholder.configure({
    placeholder: "Press '/' for commands",
  }),
];

const extensions = [
  ...BaseKit,

  History,
  SearchAndReplace,
  Clear,
  FontFamily,
  Heading,
  FontSize,
  FormatPainter,
  Bold,
  Italic,
  TextUnderline,
  Strike,
  MoreMark,
  Emoji.configure({
    suggestion: {
      items: async ({ query }: any) => {
        const { EMOJI_LIST } = await import('@/emojis');
        const lowerCaseQuery = query?.toLowerCase();

        return EMOJI_LIST.filter(({ name }) => name.toLowerCase().includes(lowerCaseQuery));
      },
    },
  }),
  Color,
  Highlight,
  BulletList,
  OrderedList,
  TextAlign,
  Indent,
  LineHeight,
  TaskList,
  Link,
  Image.configure({
    upload: (files: File) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(files));
        }, 300);
      });
    },
  }),
  Video.configure({
    upload: (files: File) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(files));
        }, 300);
      });
    },
  }),
  ImageGif.configure({
    provider: 'giphy',
    API_KEY: import.meta.env.VITE_GIPHY_API_KEY as string,
  }),
  Blockquote,
  HorizontalRule,
  Code,
  CodeBlock,

  Column,
  ColumnNode,
  MultipleColumnNode,
  Table,
  Iframe,
  ExportPdf,
  ImportWord,
  ExportWord,
  ExportMarkdown,
  TextDirection,
  Attachment.configure({
    upload: (file: any) => {
      // fake upload return base 64
      const reader = new FileReader();
      reader.readAsDataURL(file);

      return new Promise((resolve) => {
        setTimeout(() => {
          const blob = convertBase64ToBlob(reader.result as string);
          resolve(URL.createObjectURL(blob));
        }, 300);
      });
    },
  }),
  Katex.configure({
    loadKatex: async () => {
      const [{ default: katex }] = await Promise.all([
        import('katex'),
        import('katex/contrib/mhchem'),
      ]);
      return katex;
    },
  }),
  Excalidraw,
  Mermaid.configure({
    upload: (file: any) => {
      // fake upload return base 64
      const reader = new FileReader();
      reader.readAsDataURL(file);

      return new Promise((resolve) => {
        setTimeout(() => {
          const blob = convertBase64ToBlob(reader.result as string);
          resolve(URL.createObjectURL(blob));
        }, 300);
      });
    },
  }),
  Drawer.configure({
    upload: (file: any) => {
      // fake upload return base 64
      const reader = new FileReader();
      reader.readAsDataURL(file);

      return new Promise((resolve) => {
        setTimeout(() => {
          const blob = convertBase64ToBlob(reader.result as string);
          resolve(URL.createObjectURL(blob));
        }, 300);
      });
    },
  }),
  Twitter,
  Mention.configure({
    suggestion: {
      char: '@',
      items: async ({ query }: any) => {
        console.log('query', query);
        // const data = MOCK_USERS.map(item => item.label);
        // return data.filter(item => item.toLowerCase().startsWith(query.toLowerCase()));
        return MOCK_USERS.filter((item) =>
          item.label.toLowerCase().startsWith(query.toLowerCase())
        );
      },
    },
    // suggestions: [
    //   {
    //     char: '@',
    //     items: async ({ query }: any) => {
    //       return MOCK_USERS.filter(item => item.label.toLowerCase().startsWith(query.toLowerCase()));
    //     },
    //   },
    //   {
    //     char: '#',
    //     items: async ({ query }: any) => {
    //       return MOCK_USERS.filter(item => item.label.toLowerCase().startsWith(query.toLowerCase()));
    //     },
    //   }
    // ]
  }),
  AI.configure({
    protocol: import.meta.env.VITE_AI_PROTOCOL === 'anthropic' ? 'anthropic' : 'openai',
    apiKey: import.meta.env.VITE_AI_API_KEY || '',
    model: import.meta.env.VITE_AI_MODEL || '',
    baseURL: import.meta.env.VITE_AI_BASE_URL || '',
  }),
  SlashCommand,
  ShortMessage.configure({
    shortcut: 'Shift-Space',
    messages: [
      { short: 'nsfw', long_content: 'Not safe forward' },
      { short: 'brb', long_content: 'Be right back' },
      {
        short: 'ty',
        long_content: 'Thank you for your time and consideration.',
      },
      {
        short: 'sig',
        long_content: '<p>Best regards,<br><strong>Hung</strong></p>',
      },
    ],
  }),
  CodeView,
  Callout,
  Details,
  TableOfContents,
  MarkdownPaste,
  //  Collaboration.configure({
  //   document: hocuspocusProvider.document,
  // }),
  // CollaborationCaret.configure({
  //   provider: hocuspocusProvider,
  //   user: {
  //     color: getRandomColor(),
  //   },
  // }),
];

const DEFAULT = `<h1>ReUI block editor</h1>
<p>Select text for the floating toolbar. Type / in an empty paragraph to insert a block; use the block handle to move it.</p>
<div data-type="table-of-contents"></div>
<h2>Write and organize</h2>
<p>Try headings, lists, tables and review the generated HTML below. This playground uses the same editor components as the SAP demo.</p>
<details open><summary>Explore the editor</summary><div data-type="detailsContent"><p>The toolbar includes media uploads, diagrams, search and replace, and document export. Sample content is fictitious.</p></div></details>
<h2>Code and rich content</h2>
<pre><code class="language-js">const editor = 'ReUI';</code></pre><p></p>`;

function debounce(func: any, wait: number) {
  let timeout: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeout);
    // @ts-ignore
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const languages = [
  ['vi', 'Vietnamese'],
  ['en', 'English'],
  ['zh_CN', 'Chinese'],
  ['pt_BR', 'Português'],
  ['hu_HU', 'Hungarian'],
  ['ja', '日本語'],
] as const;
const colors = ['default', 'red', 'blue', 'green', 'orange', 'rose', 'violet', 'yellow'] as const;

const Header = ({ editor }: { editor: import('@tiptap/core').Editor | null }) => {
  const [editorEditable, setEditorEditable] = useState(true);
  const currentLocale = useLocale();
  const currentTheme = useTheme();

  useEffect(() => {
    localeActions.setLang('en');
    themeActions.setColor('blue');
  }, []);
  useEffect(() => {
    if (!editor) return;
    const update = () => setEditorEditable(editor.isEditable);
    update();
    editor.on('update', update);
    return () => {
      editor.off('update', update);
    };
  }, [editor]);

  return (
    <Card data-richtext-portal role='region' aria-label='Playground settings'>
      <CardHeader>
        <div>
          <h1 className='playground-title'>ReUI block editor</h1>
          <p className='playground-subtitle'>
            Library playground · Write, select text or type / to insert a block
          </p>
        </div>
        <ReuiButton variant='outline' size='sm' asChild>
          <a href='sap/'>SAP 文档演示 →</a>
        </ReuiButton>
      </CardHeader>
      <CardContent className='playground-settings-content'>
        <div className='playground-setting-row' role='group' aria-label='Language'>
          <span className='playground-setting-label'>Language</span>
          <div className='playground-setting-options'>
            {languages.map(([value, label]) => (
              <Toggle
                key={value}
                variant='outline'
                size='sm'
                pressed={currentLocale.lang === value}
                onPressedChange={() => localeActions.setLang(value)}
              >
                {label}
              </Toggle>
            ))}
          </div>
        </div>
        <div className='playground-setting-row' role='group' aria-label='Appearance'>
          <span className='playground-setting-label'>Appearance</span>
          <div className='playground-setting-options'>
            <Toggle
              variant='outline'
              size='sm'
              pressed={currentTheme.theme === 'light'}
              onPressedChange={() => themeActions.setTheme('light')}
            >
              Theme light
            </Toggle>
            <Toggle
              variant='outline'
              size='sm'
              pressed={currentTheme.theme === 'dark'}
              onPressedChange={() => themeActions.setTheme('dark')}
            >
              Theme dark
            </Toggle>
            <ReuiButton
              variant='outline'
              size='sm'
              onClick={() => editor?.setEditable(!editorEditable)}
            >
              {editorEditable ? 'Editable' : 'Disabled'}
            </ReuiButton>
          </div>
        </div>
        <div className='playground-setting-row' role='group' aria-label='Accent color'>
          <span className='playground-setting-label'>Accent</span>
          <div className='playground-setting-options'>
            {colors.map((value) => (
              <Toggle
                key={value}
                variant='outline'
                size='sm'
                pressed={currentTheme.color === value}
                onPressedChange={() => themeActions.setColor(value)}
              >
                {value === 'default' ? 'Color default' : `Theme ${value}`}
              </Toggle>
            ))}
          </div>
        </div>
        <div className='playground-setting-row'>
          <span className='playground-setting-label'>Border radius</span>
          <Slider
            min={0}
            max={3}
            step={0.05}
            defaultValue={[0.65]}
            className='richtext-w-48'
            onValueChange={([value]) => themeActions.setBorderRadius(`${value}rem`)}
          >
            <SliderThumb aria-label='Border radius' />
          </Slider>
        </div>
      </CardContent>
    </Card>
  );
};

const RichTextToolbar = () => {
  return (
    <CardHeader
      role='toolbar'
      aria-label='Editor formatting'
      className='richtext-min-h-0 richtext-justify-start richtext-gap-1 richtext-p-1'
    >
      <RichTextUndo />
      <RichTextRedo />
      <RichTextSearchAndReplace />
      <RichTextClear />
      <RichTextFormatPainter />
      <RichTextFontFamily />
      <RichTextHeading />
      <RichTextFontSize />
      <RichTextBold />
      <RichTextItalic />
      <RichTextUnderline />
      <RichTextStrike />
      <RichTextMoreMark />
      <RichTextEmoji />
      <RichTextColor />
      <RichTextHighlight />
      <RichTextBulletList />
      <RichTextOrderedList />
      <RichTextAlign />
      <RichTextIndent />
      <RichTextLineHeight />
      <RichTextTaskList />
      <RichTextLink />
      <RichTextImage />
      <RichTextVideo />
      <RichTextImageGif />
      <RichTextBlockquote />
      <RichTextHorizontalRule />
      <RichTextCode />
      <RichTextCodeBlock />
      <RichTextColumn />
      <RichTextTable />
      <RichTextIframe />
      <RichTextExportPdf />
      <RichTextImportWord />
      <RichTextExportWord />
      <RichTextExportMarkdown />
      <RichTextTextDirection />
      <RichTextAttachment />
      <RichTextKatex />
      <RichTextExcalidraw />
      <RichTextMermaid />
      <RichTextDrawer />
      <RichTextTwitter />
      <RichTextCodeView />
      <RichTextCallout />
      <RichTextDetails />
      <RichTextTableOfContents />
    </CardHeader>
  );
};

function App() {
  const [content, setContent] = useState(DEFAULT);
  const theme = useTheme();

  const onValueChange = useCallback(
    debounce((value: any) => {
      setContent(value);
    }, 300),
    []
  );

  const editor = useEditor({
    // shouldRerenderOnTransaction:  false,
    textDirection: 'auto', // global text direction
    content,
    extensions,
    // content,
    // immediatelyRender: false, // error duplicate plugin key
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onValueChange(html);
    },
  });

  useEffect(() => {
    window['editor'] = editor;
  }, [editor]);

  return (
    <main
      data-richtext-portal
      className={`playground-shell richtext-mx-auto richtext-my-8 richtext-flex richtext-w-full richtext-max-w-screen-lg richtext-flex-col richtext-gap-6 richtext-p-6 ${theme.theme === 'dark' ? 'dark' : ''}`}
    >
      <Header editor={editor} />

      <RichTextProvider editor={editor}>
        <Card className='richtext-min-w-0'>
          <RichTextToolbar />

          <CardContent className='richtext-p-0'>
            <EditorContent editor={editor} />
          </CardContent>

          {/* Bubble */}
          <RichTextBubbleCallout />
          <RichTextBubbleColumns />
          <RichTextBubbleDrawer />
          <RichTextBubbleExcalidraw />
          <RichTextBubbleIframe />
          <RichTextBubbleKatex />
          <RichTextBubbleLink />

          <RichTextBubbleImage />
          <RichTextBubbleVideo />
          <RichTextBubbleImageGif />

          <RichTextBubbleMermaid />
          <RichTextBubbleTable />
          <RichTextBubbleText />
          <RichTextBubbleTwitter />
          <RichTextBubbleCodeBlock />

          <RichTextBubbleMenuDragHandle />

          {/* Command List */}
          <SlashCommandList />
        </Card>
      </RichTextProvider>

      {typeof content === 'string' && (
        <div data-richtext-portal>
          <ReuiTextarea
            aria-label='Document HTML'
            style={{
              marginTop: 20,
              height: 500,
            }}
            readOnly
            value={content}
          />
        </div>
      )}
    </main>
  );
}

export default App;
