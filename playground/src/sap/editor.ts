import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { ListItem } from "@tiptap/extension-list";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { TextStyle } from "@tiptap/extension-text-style";
import { Dropcursor, Gapcursor, TrailingNode } from "@tiptap/extensions";
import { Bold } from "reactjs-tiptap-editor/bold";
import { BulletList } from "reactjs-tiptap-editor/bulletlist";
import { Color } from "reactjs-tiptap-editor/color";
import { FontFamily } from "reactjs-tiptap-editor/fontfamily";
import { FontSize } from "reactjs-tiptap-editor/fontsize";
import { Heading } from "reactjs-tiptap-editor/heading";
import { Highlight } from "reactjs-tiptap-editor/highlight";
import { History } from "reactjs-tiptap-editor/history";
import { Italic } from "reactjs-tiptap-editor/italic";
import { OrderedList } from "reactjs-tiptap-editor/orderedlist";
import { SearchAndReplace } from "reactjs-tiptap-editor/searchandreplace";
import { SlashCommand } from "reactjs-tiptap-editor/slashcommand";
import { Strike } from "reactjs-tiptap-editor/strike";
import { Table } from "reactjs-tiptap-editor/table";
import { TextAlign } from "reactjs-tiptap-editor/textalign";
import { TextUnderline } from "reactjs-tiptap-editor/textunderline";

import { SectionIdentity, SapComment } from "./extensions";
export const extensions = [
  Document,
  Paragraph,
  TrailingNode,
  Text,
  HardBreak,
  ListItem,
  TextStyle,
  Dropcursor,
  Gapcursor,
  Bold,
  Italic,
  TextUnderline,
  Strike,
  Heading.configure({ levels: [1, 2, 3] }),
  History,
  FontFamily,
  FontSize,
  Color,
  Highlight,
  BulletList,
  OrderedList,
  TextAlign,
  Table.configure({ resizable: true }),
  SearchAndReplace,
  SlashCommand,
  SectionIdentity,
  SapComment,
];
