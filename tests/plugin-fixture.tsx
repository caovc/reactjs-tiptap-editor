import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import { createRoot } from "react-dom/client";
import { RichTextProvider } from "../src/components/RichTextProvider";
import { RichTextAttachment, Attachment } from "../src/extensions/Attachment";
import { RichTextImageGif, ImageGif } from "../src/extensions/ImageGif";
import { Heading } from "../src/extensions/Heading";
import {
  RichTextTableOfContents,
  TableOfContents,
} from "../src/extensions/TableOfContents";
import "../lib/style.css";
function Fixture() {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading,
      Attachment.configure({
        upload: async (file: File) => URL.createObjectURL(file),
      }),
      ImageGif.configure({ API_KEY: "fixture-public-example" }),
      TableOfContents,
    ],
    content: "<h1>Fixture heading</h1><p>Fixture body</p>",
  });
  if (!editor) return null;
  return (
    <RichTextProvider editor={editor}>
      <RichTextAttachment />
      <RichTextImageGif />
      <RichTextTableOfContents />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
const root = document.getElementById("root");
if (!root) throw Error("Missing fixture root");
createRoot(root).render(<Fixture />);
