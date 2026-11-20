import { Bold, Italic, List, ListOrdered, Underline } from "lucide-react";
import { useEffect } from "react";
import {
  RichTextBubbleMenuDragHandle,
  RichTextBubbleText,
} from "reactjs-tiptap-editor/bubble";
import { localeActions } from "reactjs-tiptap-editor/locale";
import { SlashCommandList } from "reactjs-tiptap-editor/slashcommand";

import { Card } from "@/components/reui/card";
import { Button } from "@/components/reui/button";

import { INSERTS } from "./document";

import type { Editor, JSONContent } from "@tiptap/core";
import type { ComponentProps } from "react";

type CommandGroups = NonNullable<
  ComponentProps<typeof SlashCommandList>["commandList"]
>;
type Command = CommandGroups[number]["commands"][number];
const commands: CommandGroups = [
  {
    name: "format",
    title: "基本块",
    commands: [
      {
        name: "paragraph",
        label: "正文",
        aliases: ["text", "p"],
        action: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setParagraph().run();
        },
      },
      ...([1, 2, 3] satisfies (1 | 2 | 3)[]).map<Command>((level) => ({
        name: `heading${level}`,
        label: `标题 ${level}`,
        aliases: [`h${level}`, "heading"],
        action: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setHeading({ level }).run();
        },
      })),
      {
        name: "bulletList",
        label: "项目符号列表",
        aliases: ["bullet", "ul"],
        action: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
      },
      {
        name: "orderedList",
        label: "编号列表",
        aliases: ["ordered", "ol"],
        action: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
      },
    ],
  },
  {
    name: "sap",
    title: "SAP 结构化区块 · 虚构示例",
    commands: INSERTS.map<Command>((item) => ({
      name: item.id,
      label: item.title,
      aliases: [item.id, "sap"],
      action: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent(item.build())
          .run();
      },
    })),
  },
];

// Duplicate content/formatting, not section identity or the original local review anchor.
function duplicateContent(node: JSONContent): JSONContent {
  const { sapId: _sapId, sectionNumber: _number, ...attrs } = node.attrs || {};
  return {
    ...node,
    attrs,
    marks: node.marks?.filter((mark) => mark.type !== "sapComment"),
    content: node.content?.map(duplicateContent),
  };
}

/** Same library slash renderer, drag/drop node handle and text bubble as the main editor. */
export function SapBlockTools({ editor }: { editor: Editor }) {
  useEffect(() => {
    localeActions.setMessage("sap-zh", {
      "editor.draghandle.insertBefore": "在块前插入",
      "editor.draghandle.insertAfter": "在块后插入",
      "editor.draghandle.moveUp": "上移块",
      "editor.draghandle.moveDown": "下移块",
      "editor.draghandle.paragraph": "转换为正文",
      "editor.draghandle.heading": "转换为二级标题",

      "editor.remove": "删除块",
      "editor.copy": "重复块",
      "editor.copyToClipboard": "复制块",
      "editor.draghandle.insertBlock": "插入块",
      "editor.draghandle.grip": "块操作（按住拖拽）",
      "editor.textalign.tooltip": "对齐",
      "editor.textalign.left.tooltip": "左对齐",
      "editor.textalign.center.tooltip": "居中",
      "editor.textalign.right.tooltip": "右对齐",
      "editor.slash.empty": "没有匹配的区块",
    });
    localeActions.setLang("sap-zh");
  }, []);
  return (
    <>
      <SlashCommandList commandList={commands} />
      <RichTextBubbleMenuDragHandle transformCopiedNode={duplicateContent} />
      <RichTextBubbleText
        buttonBubble={
          <Card
            data-richtext-portal
            className="sap-selection-toolbar"
            role="toolbar"
            aria-label="文本浮动工具栏"
          >
            {[
              {
                label: "浮动加粗",
                icon: Bold,
                active: editor.isActive("bold"),
                run: () => editor.chain().focus().toggleBold().run(),
              },
              {
                label: "浮动斜体",
                icon: Italic,
                active: editor.isActive("italic"),
                run: () => editor.chain().focus().toggleItalic().run(),
              },
              {
                label: "浮动下划线",
                icon: Underline,
                active: editor.isActive("underline"),
                run: () => editor.chain().focus().toggleUnderline().run(),
              },
              {
                label: "浮动项目符号",
                icon: List,
                active: editor.isActive("bulletList"),
                run: () => editor.chain().focus().toggleBulletList().run(),
              },
              {
                label: "浮动编号列表",
                icon: ListOrdered,
                active: editor.isActive("orderedList"),
                run: () => editor.chain().focus().toggleOrderedList().run(),
              },
            ].map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                size="icon"
                type="button"
                aria-label={item.label}
                aria-pressed={item.active}
                onMouseDown={(event) => event.preventDefault()}
                onClick={item.run}
              >
                <item.icon />
              </Button>
            ))}
          </Card>
        }
      />
    </>
  );
}
