import { getSchema } from "@tiptap/core";
import { EditorState } from "@tiptap/pm/state";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDown,
  Bold,
  BookOpen,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Download,
  FileCode,
  FileJson,
  FileText,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  MessageSquare,
  MessageSquarePlus,
  Minus,
  PanelLeftClose,
  PanelRightClose,
  Plus,
  Printer,
  Redo2,
  RotateCcw,
  Search,
  ShieldCheck,
  Strikethrough,
  Table2,
  Trash2,
  Type,
  Underline,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { RichTextProvider } from "reactjs-tiptap-editor";
import { toast } from "sonner";

import { Button } from "@/components/reui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/reui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/reui/dropdown-menu";
import { Input } from "@/components/reui/input";
import { Separator } from "@/components/reui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/reui/tabs";
import { Textarea } from "@/components/reui/textarea";

import { SapBlockTools } from "./blocks";
import { Action, Choice, Field, Format, RibbonGroup } from "./controls";
import { DISCLAIMER, INSERTS, REQUIRED_SECTIONS, table } from "./document";
import { extensions } from "./editor";
import {
  commentAnchor,
  findMatches,
  getOutline,
  isolateHistory,
  jumpTo,
} from "./extensions";
import {
  checkDocument,
  download,
  importHtml,
  loadDraft,
  newDraft,
  parseDraft,
  safePastedHtml,
  STORAGE_KEY,
  type Draft,
  type Metadata,
} from "./model";

type Modal =
  | { kind: "closed" | "about" | "reset" }
  | { kind: "glossary"; from: number; to: number }
  | { kind: "comment"; from: number; to: number; quote: string }
  | { kind: "import"; draft: Draft; filename: string };
const styleOptions = [
  { value: "p", label: "正文" },
  { value: "1", label: "标题 1" },
  { value: "2", label: "标题 2" },
  { value: "3", label: "标题 3" },
];
const fontOptions = [
  { value: "serif", label: "宋体 / 衬线" },
  { value: "sans-serif", label: "黑体 / 无衬线" },
  { value: "Arial", label: "Arial" },
  { value: "Times New Roman", label: "Times New Roman" },
];
const sizeOptions = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36].map((n) => ({
  value: `${n}px`,
  label: `${n}`,
}));
const schema = getSchema(extensions);
function initialState() {
  const loaded = loadDraft();
  try {
    return { draft: parseDraft(loaded.draft, { schema }), error: loaded.error };
  } catch {
    return {
      draft: newDraft(),
      error:
        "草稿正文结构无效；已打开演示副本并暂停保存，原草稿未覆盖。请备份后确认重置。",
    };
  }
}
export default function SapApp() {
  const [initial] = useState(initialState);
  const [draft, setDraft] = useState<Draft>(initial.draft);
  const [storageError, setStorageError] = useState(initial.error);
  const [saveEnabled, setSaveEnabled] = useState(!initial.error);
  const allowSave = useRef(!initial.error);
  const [saveStatus, setSaveStatus] = useState("正在打开");
  const [ribbon, setRibbon] = useState("home");
  const [panel, setPanel] = useState("elements");
  const [leftOpen, setLeftOpen] = useState(() => window.innerWidth >= 1000);
  const [rightOpen, setRightOpen] = useState(() => window.innerWidth >= 1280);
  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 999px)");
    const closePanels = () => {
      if (narrow.matches) {
        setLeftOpen(false);
        setRightOpen(false);
      }
    };
    narrow.addEventListener("change", closePanels);
    return () => narrow.removeEventListener("change", closePanels);
  }, []);

  const [zoom, setZoom] = useState(85);
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [matchIndex, setMatchIndex] = useState(0);
  const [modal, setModal] = useState<Modal>({ kind: "closed" });
  const [noteText, setNoteText] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions,
    content: initial.draft.doc,
    editorProps: {
      attributes: {
        "aria-label": "SAP 文档正文",
        role: "textbox",
        "aria-multiline": "true",
        spellcheck: "false",
      },
      transformPastedHTML: safePastedHtml,
      handlePaste: (_view, event) => {
        if (
          (event.clipboardData?.getData("text/plain").length || 0) > 200000 ||
          (event.clipboardData?.getData("text/html").length || 0) > 2000000
        ) {
          event.preventDefault();
          toast.error(
            "粘贴内容过大，请分段粘贴（文本 20 万字符 / HTML 2 MB）。",
          );
          return true;
        }
        return false;
      },
      handleDOMEvents: {
        drop: (_view, event) => Boolean(event.dataTransfer?.files.length),
      },
    },
    onCreate: ({ editor }) => {
      editor.commands.command(({ tr }) => {
        tr.setMeta("sap-init", true);
        return true;
      });
    },
    onUpdate: ({ editor }) =>
      setDraft((previous) => ({ ...previous, doc: editor.getJSON() })),
  });
  const editorState = useEditorState({
    editor,
    selector: (context) => context.editor?.state,
  });
  const outline = useMemo(
    () => (editorState ? getOutline(editorState.doc) : []),
    [editorState],
  );
  const issues = editor ? checkDocument(editor, draft) : [];
  const matches = useMemo(
    () => (editorState ? findMatches(editorState.doc, query) : []),
    [editorState, query],
  );
  const currentSection = outline
    .filter((item) => item.pos <= (editorState?.selection.from || 0))
    .at(-1)?.id;
  const openNotes = draft.comments.filter(
    (note) => note.status === "open",
  ).length;
  const foundSections = REQUIRED_SECTIONS.filter((title) =>
    outline.some((item) => item.text.includes(title)),
  ).length;

  useEffect(() => {
    if (!editor || !saveEnabled) {
      setSaveStatus("自动保存已暂停");
      return;
    }
    setSaveStatus("正在保存…");
    const timeout = window.setTimeout(() => {
      if (!allowSave.current) return;
      try {
        const valid = parseDraft(draft, editor);
        const text = JSON.stringify(valid);
        if (text.length > 2_000_000) throw new Error("文档超出 2 MB 上限");
        localStorage.setItem(STORAGE_KEY, text);
        setSaveStatus("已保存到本机");
        setStorageError(null);
      } catch (error) {
        setSaveStatus("保存失败");
        setStorageError(
          `保存失败：${error instanceof Error ? error.message : "浏览器存储不可用"}。请立即导出 JSON 备份。`,
        );
      }
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [draft, editor, saveEnabled]);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        allowSave.current = false;
        setSaveEnabled(false);
        setStorageError(
          "另一标签页已修改本地草稿，自动保存已暂停。请先导出本页备份，再刷新加载最新草稿；不要直接覆盖。",
        );
      }
    };
    const onLeave = (event: BeforeUnloadEvent) => {
      if (saveStatus !== "已保存到本机") event.preventDefault();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [saveStatus]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        setRightOpen(true);
        setPanel("search");
        window.setTimeout(
          () =>
            document
              .querySelector<HTMLInputElement>("input[data-sap-search]")
              ?.focus(),
          0,
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  if (!editor) return <div role="status">正在打开统计分析计划…</div>;

  function updateMeta(key: keyof Metadata, value: string) {
    setDraft((previous) => ({
      ...previous,
      meta: { ...previous.meta, [key]: value },
    }));
  }
  function showPanel(value: string) {
    setRightOpen(true);
    setPanel(value);
  }
  function openGlossary() {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    setModal({ kind: "glossary", from, to });
  }
  function addComment() {
    if (!editor) return;
    const { from, to, empty } = editor.state.selection;
    if (empty) {
      toast.info("请先在正文中选中要批注的文字。");
      return;
    }
    let overlap = false;
    editor.state.doc.nodesBetween(from, to, (node) => {
      if (node.marks.some((mark) => mark.type.name === "sapComment"))
        overlap = true;
    });
    if (overlap) {
      toast.error("选区已有批注，请选择不重叠的文字。");
      return;
    }
    if (draft.comments.length >= 200) {
      toast.error("本地演示最多支持 200 条批注。");
      return;
    }
    setNoteText("");
    setModal({
      kind: "comment",
      from,
      to,
      quote: editor.state.doc.textBetween(from, to, " ").slice(0, 180),
    });
  }
  function saveComment() {
    if (!editor || modal.kind !== "comment" || !noteText.trim()) return;
    const id = `note-${crypto.randomUUID()}`;
    isolateHistory(editor, () => {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: modal.from, to: modal.to })
        .setMark("sapComment", { id })
        .run();
    });
    setDraft((previous) => ({
      ...previous,
      comments: [
        ...previous.comments,
        { id, body: noteText.trim(), status: "open" },
      ],
    }));
    setModal({ kind: "closed" });
    showPanel("review");
  }
  function toggleComment(id: string) {
    if (!editor) return;
    const note = draft.comments.find((item) => item.id === id);
    if (!note) return;
    const status = note.status === "open" ? "resolved" : "open";
    // Review status is separate from document history, so undo/redo cannot resurrect stale status.
    setDraft((previous) => ({
      ...previous,
      comments: previous.comments.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    }));
  }
  function applyDraft(next: Draft) {
    if (!editor) return;
    editor.commands.setSearchTerm("");
    setQuery("");
    setMatchIndex(0);
    // A replacement is a new document session: never undo into another document's comment anchors.
    editor.view.updateState(
      EditorState.create({
        schema: editor.schema,
        doc: editor.schema.nodeFromJSON(next.doc),
        plugins: editor.state.plugins,
      }),
    );
    editor.commands.command(({ tr }) => {
      tr.setMeta("sap-init", true);
      return true;
    });
    setDraft({ ...next, doc: editor.getJSON() });
    allowSave.current = true;
    setSaveEnabled(true);
    setStorageError(null);
    setModal({ kind: "closed" });
    toast.success("文档已打开，将自动保存到本机。");
  }
  async function readFile(file: File) {
    try {
      if (file.size > 2_000_000) throw new Error("文件超过 2 MB 上限。");
      const text = await file.text();
      const next = /\.json$/i.test(file.name)
        ? parseDraft(JSON.parse(text), editor || undefined)
        : /\.html?$/i.test(file.name) && editor
          ? importHtml(text, draft, editor)
          : null;
      if (!next) throw new Error("请选择 .json、.html 或 .htm 文件。");
      setModal({ kind: "import", draft: next, filename: file.name });
    } catch (error) {
      toast.error(
        `导入失败，当前文档未更改。${error instanceof Error ? error.message : "请检查文件格式。"}`,
      );
    }
  }
  function exportJson() {
    try {
      const valid = parseDraft(
        { ...draft, doc: editor?.getJSON() },
        editor || undefined,
      );
      download(
        "SAP-Studio.json",
        JSON.stringify(valid, null, 2),
        "application/json",
      );
      toast.success("JSON 已导出，包含正文、方案信息、术语与批注。");
    } catch (error) {
      toast.error(
        `无法导出：${error instanceof Error ? error.message : "格式无效"}`,
      );
    }
  }
  function exportHtml() {
    if (!editor) return;
    const output = document.implementation.createHTMLDocument(draft.meta.title);
    output.documentElement.lang = "zh-CN";
    const charset = output.createElement("meta");
    charset.setAttribute("charset", "utf-8");
    output.head.prepend(charset);
    const style = output.createElement("style");
    style.textContent =
      'body{max-width:170mm;margin:20mm auto;font:14px/1.9 serif;color:#172033}table{border-collapse:collapse;width:100%}td,th{border:1px solid #cbd1da;padding:8px}h1,h2,h3{break-after:avoid}h1:before,h2:before,h3:before{content:attr(data-section-number) "  "}';
    output.head.append(style);
    output.body.innerHTML = editor.getHTML();
    download(
      "SAP-body.html",
      `<!doctype html>\n${output.documentElement.outerHTML}`,
      "text/html;charset=utf-8",
    );
    toast.success("已导出正文 HTML；完整元数据与批注记录请使用 JSON。");
  }
  function findNext() {
    if (!editor || !matches.length) return;
    const index = matchIndex % matches.length;
    const match = matches[index];
    jumpTo(editor, match.from, match.to);
    setMatchIndex((index + 1) % matches.length);
  }
  function replace(all: boolean) {
    if (!editor || !matches.length) return;
    const selected = all
      ? matches
      : [matches[matchIndex === 0 ? 0 : (matchIndex - 1) % matches.length]];
    const tr = editor.state.tr;
    for (const match of [...selected].reverse())
      tr.insertText(replacement, match.from, match.to);
    isolateHistory(editor, () => {
      editor.view.dispatch(tr);
    });
    setMatchIndex(0);
    toast.success(`已替换 ${selected.length} 处；可撤销。`);
  }
  const iconFormat = (
    label: string,
    mark: string,
    icon: React.ReactNode,
    run: () => void,
  ) => (
    <Format label={label} active={editor.isActive(mark)} run={run}>
      {icon}
    </Format>
  );
  return (
    <RichTextProvider editor={editor}>
      <div className="sap-app" data-margin={draft.margin}>
        <style media="print">{`@page { size: A4 portrait; margin: ${draft.margin === "normal" ? 20 : 15}mm; }`}</style>
        <style>
          {draft.comments
            .filter((note) => note.status === "resolved")
            .map(
              (note) =>
                `.sap-paper .sap-comment[data-comment-id="${note.id}"]{background:transparent;border-bottom:1px dotted #94a3b8}`,
            )
            .join("\n")}
        </style>
        <header className="sap-titlebar">
          <a
            className="sap-brand"
            href={import.meta.env.BASE_URL}
            aria-label="返回原编辑器 Playground"
          >
            <FileText />
            <span>
              SAP<span className="sap-brand-light"> Studio</span>
            </span>
          </a>
          <Separator orientation="vertical" className="sap-title-separator" />
          <div className="sap-file-identity">
            <Button
              variant="ghost"
              size="sm"
              className="sap-file-name"
              aria-label="编辑文档信息"
              onClick={() => showPanel("elements")}
            >
              {draft.meta.protocol || "未命名方案"} · 统计分析计划{" "}
              <ChevronDown />
            </Button>
            <span className="sap-save" role="status">
              <Check />
              {saveStatus}
            </span>
          </div>
          <div className="sap-header-actions">
            <span className="sap-demo-label">虚构研究 · 本地演示</span>
            <Action
              label="演示说明"
              onClick={() => setModal({ kind: "about" })}
            >
              <CircleHelp />
            </Action>
            <Action label="打印 / 另存 PDF" onClick={() => window.print()}>
              <Printer />
            </Action>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Download data-icon="inline-start" />
                  导出
                  <ChevronDown data-icon="inline-end" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={exportJson}>
                    <FileJson />
                    完整文档 JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={exportHtml}>
                    <FileCode />
                    正文 HTML
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => window.print()}>
                    <Printer />
                    打印 / 另存 PDF
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <Tabs value={ribbon} onValueChange={setRibbon} className="sap-ribbon">
          <div className="sap-tab-row">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  文件
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => fileInput.current?.click()}>
                    <Upload />
                    导入 JSON / HTML
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={exportJson}>
                    <Download />
                    导出完整 JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={exportHtml}>
                    <FileCode />
                    导出正文 HTML
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => setModal({ kind: "reset" })}
                  >
                    <RotateCcw />
                    重置演示模板
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <TabsList variant="line" size="sm" aria-label="文档功能区">
              <TabsTrigger value="home">开始</TabsTrigger>
              <TabsTrigger value="insert">插入</TabsTrigger>
              <TabsTrigger value="layout">布局</TabsTrigger>
              <TabsTrigger value="review">审阅</TabsTrigger>
            </TabsList>
            <div className="sap-quick">
              <Action label="查找和替换" onClick={() => showPanel("search")}>
                <Search />
              </Action>
              <Action label="结构检查" onClick={() => showPanel("checks")}>
                <ShieldCheck />
              </Action>
            </div>
          </div>
          <TabsContent value="home" className="sap-ribbon-panel">
            <RibbonGroup label="历史">
              <Action
                label="撤销"
                disabled={!editor.can().undo()}
                onClick={() => editor.chain().focus().undo().run()}
              >
                <Undo2 />
              </Action>
              <Action
                label="重做"
                disabled={!editor.can().redo()}
                onClick={() => editor.chain().focus().redo().run()}
              >
                <Redo2 />
              </Action>
            </RibbonGroup>
            <RibbonGroup label="字体">
              <div className="sap-format-grid">
                <div className="sap-control-row">
                  <Choice
                    label="字体"
                    value={
                      editor.getAttributes("textStyle").fontFamily || "serif"
                    }
                    options={fontOptions}
                    onChange={(value) =>
                      editor.chain().focus().setFontFamily(value).run()
                    }
                    className="sap-font-choice"
                  />
                  <Choice
                    label="字号"
                    value={editor.getAttributes("textStyle").fontSize || "14px"}
                    options={sizeOptions}
                    onChange={(value) =>
                      editor.chain().focus().setFontSize(value).run()
                    }
                    className="sap-size-choice"
                  />
                </div>
                <div className="sap-control-row">
                  {iconFormat("粗体", "bold", <Bold />, () =>
                    editor.chain().focus().toggleBold().run(),
                  )}
                  {iconFormat("斜体", "italic", <Italic />, () =>
                    editor.chain().focus().toggleItalic().run(),
                  )}
                  {iconFormat("下划线", "underline", <Underline />, () =>
                    editor.chain().focus().toggleUnderline().run(),
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" aria-label="字体颜色">
                        <Type />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onSelect={() =>
                            editor.chain().focus().unsetColor().run()
                          }
                        >
                          默认颜色
                        </DropdownMenuItem>
                        {[
                          { label: "深蓝", value: "#24559a" },
                          { label: "红色", value: "#b4232a" },
                          { label: "深绿", value: "#28734d" },
                        ].map((color) => (
                          <DropdownMenuItem
                            key={color.value}
                            onSelect={() =>
                              editor.chain().focus().setColor(color.value).run()
                            }
                          >
                            {color.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {iconFormat("删除线", "strike", <Strikethrough />, () =>
                    editor.chain().focus().toggleStrike().run(),
                  )}
                  {iconFormat(
                    "黄色突出显示",
                    "highlight",
                    <Highlighter />,
                    () =>
                      editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: "#fef08a" })
                        .run(),
                  )}
                  <Action
                    label="清除格式"
                    onClick={() =>
                      editor.chain().focus().unsetAllMarks().clearNodes().run()
                    }
                  >
                    <Type />
                  </Action>
                </div>
              </div>
            </RibbonGroup>
            <RibbonGroup label="段落">
              <div className="sap-format-grid">
                <div className="sap-control-row">
                  {iconFormat("项目符号", "bulletList", <List />, () =>
                    editor.chain().focus().toggleBulletList().run(),
                  )}
                  {iconFormat("编号列表", "orderedList", <ListOrdered />, () =>
                    editor.chain().focus().toggleOrderedList().run(),
                  )}
                </div>
                <div className="sap-control-row">
                  {[
                    { name: "左对齐", value: "left", icon: <AlignLeft /> },
                    { name: "居中", value: "center", icon: <AlignCenter /> },
                    { name: "右对齐", value: "right", icon: <AlignRight /> },
                    {
                      name: "两端对齐",
                      value: "justify",
                      icon: <AlignJustify />,
                    },
                  ].map((item) => (
                    <Format
                      key={item.value}
                      label={item.name}
                      active={editor.isActive({ textAlign: item.value })}
                      run={() => {
                        editor.chain().focus().setTextAlign(item.value).run();
                      }}
                    >
                      {item.icon}
                    </Format>
                  ))}
                </div>
              </div>
            </RibbonGroup>
            <RibbonGroup label="样式">
              <Choice
                label="段落样式"
                value={
                  editor.isActive("heading")
                    ? String(editor.getAttributes("heading").level)
                    : "p"
                }
                options={styleOptions}
                onChange={(value) => {
                  if (value === "1" || value === "2" || value === "3")
                    editor
                      .chain()
                      .focus()
                      .setHeading({
                        level: value === "1" ? 1 : value === "2" ? 2 : 3,
                      })
                      .run();
                  else editor.chain().focus().setParagraph().run();
                }}
                className="sap-style-choice"
              />
              <span className="sap-caption">标题自动编号 · 同步目录</span>
            </RibbonGroup>
            <RibbonGroup label="编辑">
              <Action
                label="查找和替换"
                text
                onClick={() => showPanel("search")}
              >
                <Search />
              </Action>
            </RibbonGroup>
          </TabsContent>
          <TabsContent value="insert" className="sap-ribbon-panel">
            <RibbonGroup label="表格">
              <Action
                label="插入 3 × 3 表格"
                text
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run()
                }
              >
                <Table2 />
              </Action>
            </RibbonGroup>
            <RibbonGroup label="表格操作">
              <div className="sap-format-grid">
                <div className="sap-control-row">
                  <Action
                    label="表格下方加行"
                    disabled={!editor.can().addRowAfter()}
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    text
                  >
                    <Plus />
                  </Action>
                  <Action
                    label="表格右侧加列"
                    disabled={!editor.can().addColumnAfter()}
                    onClick={() =>
                      editor.chain().focus().addColumnAfter().run()
                    }
                    text
                  >
                    <Plus />
                  </Action>
                </div>
                <div className="sap-control-row">
                  <Action
                    label="删除当前行"
                    disabled={!editor.can().deleteRow()}
                    onClick={() => editor.chain().focus().deleteRow().run()}
                    text
                  >
                    <Minus />
                  </Action>
                  <Action
                    label="删除当前表格"
                    disabled={!editor.can().deleteTable()}
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    text
                  >
                    <Trash2 />
                  </Action>
                </div>
              </div>
            </RibbonGroup>
            <RibbonGroup label="SAP 区块">
              <Action
                label="SAP 组件库"
                text
                onClick={() => showPanel("elements")}
              >
                <ClipboardList />
              </Action>
              <Action label="术语和缩略语" text onClick={() => openGlossary()}>
                <BookOpen />
              </Action>
            </RibbonGroup>
            <RibbonGroup label="审阅">
              <Action label="新建批注" text onClick={addComment}>
                <MessageSquarePlus />
              </Action>
            </RibbonGroup>
          </TabsContent>
          <TabsContent value="layout" className="sap-ribbon-panel">
            <RibbonGroup label="纸张">
              <span className="sap-paper-setting">
                <FileText />
                A4 · 210 × 297 mm
              </span>
              <span className="sap-caption">纵向 · 连续文档画布</span>
            </RibbonGroup>
            <RibbonGroup label="页边距">
              <Choice
                label="页边距"
                value={draft.margin}
                options={[
                  { value: "normal", label: "标准 · 20 mm" },
                  { value: "narrow", label: "窄 · 15 mm" },
                ]}
                onChange={(value) => {
                  if (value === "normal" || value === "narrow")
                    setDraft((previous) => ({ ...previous, margin: value }));
                }}
              />
            </RibbonGroup>
            <RibbonGroup label="视图">
              <Action
                label="缩小"
                onClick={() => setZoom((n) => Math.max(40, n - 10))}
              >
                <Minus />
              </Action>
              <span>{zoom}%</span>
              <Action
                label="放大"
                onClick={() => setZoom((n) => Math.min(150, n + 10))}
              >
                <Plus />
              </Action>
              <Action label="还原 100%" text onClick={() => setZoom(100)}>
                <RotateCcw />
              </Action>
            </RibbonGroup>
            <RibbonGroup label="输出">
              <Action
                label="打印 / 另存 PDF"
                text
                onClick={() => window.print()}
              >
                <Printer />
              </Action>
              <span className="sap-caption">由浏览器真实分页；无屏幕页码</span>
            </RibbonGroup>
          </TabsContent>
          <TabsContent value="review" className="sap-ribbon-panel">
            <RibbonGroup label="批注">
              <Action label="新建批注" text onClick={addComment}>
                <MessageSquarePlus />
              </Action>
              <Action label="查看批注" text onClick={() => showPanel("review")}>
                <MessageSquare />
              </Action>
            </RibbonGroup>
            <RibbonGroup label="结构完整性">
              <Action
                label="运行结构检查"
                text
                onClick={() => showPanel("checks")}
              >
                <ShieldCheck />
              </Action>
              <span className="sap-caption">仅规则检查 · 不是统计方法验证</span>
            </RibbonGroup>
            <RibbonGroup label="边界">
              <span className="sap-caption">
                本地单人审阅，不提供修订追踪、协作或电子签名。
              </span>
              <Action
                label="演示说明"
                text
                onClick={() => setModal({ kind: "about" })}
              >
                <CircleHelp />
              </Action>
            </RibbonGroup>
          </TabsContent>
        </Tabs>
        {storageError && (
          <div className="sap-storage-error" role="alert">
            {storageError}
            <Button size="xs" variant="outline" onClick={exportJson}>
              导出本页 JSON
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => setModal({ kind: "reset" })}
            >
              重置演示模板
            </Button>
          </div>
        )}
        <div className="sap-viewbar">
          <div className="sap-control-row">
            <Action
              label={leftOpen ? "隐藏章节目录" : "显示章节目录"}
              onClick={() => {
                setLeftOpen(!leftOpen);
                if (window.innerWidth < 760) setRightOpen(false);
              }}
            >
              <PanelLeftClose />
            </Action>
            <span>编辑视图</span>
            <ChevronRight />
            <span className="sap-muted">{draft.meta.version}</span>
          </div>
          <div className="sap-control-row">
            <span className="sap-local-only">
              浏览器本地保存 · 请勿输入真实个人或患者信息
            </span>
            <Action
              label={rightOpen ? "隐藏方案助手" : "显示方案助手"}
              onClick={() => {
                setRightOpen(!rightOpen);
                if (window.innerWidth < 760) setLeftOpen(false);
              }}
            >
              <PanelRightClose />
            </Action>
          </div>
        </div>
        <main
          className="sap-workspace"
          data-left-open={leftOpen}
          data-right-open={rightOpen}
        >
          {leftOpen && (
            <aside className="sap-outline" aria-label="章节导航">
              <div className="sap-panel-heading">
                <span>
                  <List />
                  导航
                </span>
                <Button
                  variant="ghost"
                  size="xs"
                  aria-label="关闭章节目录"
                  onClick={() => setLeftOpen(false)}
                >
                  <X />
                </Button>
              </div>
              <div className="sap-outline-tools">
                <Input
                  variant="sm"
                  aria-label="筛选章节"
                  placeholder="查找章节…"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                />
                <div className="sap-outline-label">
                  <span>文档大纲</span>
                  <span>{outline.length} 节</span>
                </div>
              </div>
              <nav aria-label="文档目录">
                {outline
                  .filter((item) =>
                    item.text.toLowerCase().includes(filter.toLowerCase()),
                  )
                  .map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      size="sm"
                      className="sap-outline-item"
                      style={{ paddingLeft: 12 + (item.level - 1) * 14 }}
                      aria-current={
                        item.id === currentSection ? "location" : undefined
                      }
                      onClick={() => jumpTo(editor, item.pos + 1)}
                    >
                      <span className="sap-section-num">{item.number}</span>
                      <span>{item.text}</span>
                    </Button>
                  ))}
              </nav>
              <div className="sap-outline-footer">
                <ShieldCheck />
                <span>
                  已覆盖 {foundSections} / {REQUIRED_SECTIONS.length} 个章节主题
                  <br />
                  <small>结构提示不代表内容已验证</small>
                </span>
              </div>
            </aside>
          )}
          <section className="sap-canvas" aria-label="文档画布">
            <div className="sap-paper-wrap" style={{ zoom: zoom / 100 }}>
              <article className="sap-paper">
                <div className="sap-document-topline">
                  <span>STATISTICAL ANALYSIS PLAN</span>
                  <span>
                    {draft.meta.protocol} / {draft.meta.version}
                  </span>
                </div>
                <header className="sap-cover">
                  <div className="sap-document-kicker">统计分析计划</div>
                  <h1>{draft.meta.title || "未命名文档"}</h1>
                  <div className="sap-cover-meta">
                    <span>
                      方案编号 <strong>{draft.meta.protocol || "—"}</strong>
                    </span>
                    <span>
                      版本 <strong>{draft.meta.version || "—"}</strong>
                    </span>
                    <span>
                      编制 <strong>{draft.meta.sponsor || "—"}</strong>
                    </span>
                    <span>
                      日期 <strong>{draft.meta.date || "—"}</strong>
                    </span>
                  </div>
                  <p className="sap-document-disclaimer">{DISCLAIMER}</p>
                </header>
                <EditorContent editor={editor} />
                <SapBlockTools editor={editor} />
                <footer className="sap-document-end">
                  演示文档结束 · 正式使用前需专业审阅
                </footer>
              </article>
            </div>
          </section>
          {rightOpen && (
            <aside className="sap-assistant" aria-label="方案助手">
              <div className="sap-panel-heading">
                <span>
                  <ClipboardList />
                  方案助手
                </span>
                <span className="sap-caption">SAP 工具</span>
              </div>
              <Tabs
                value={panel}
                onValueChange={setPanel}
                className="sap-assistant-tabs"
              >
                <TabsList variant="line" size="sm" aria-label="方案助手工具">
                  <TabsTrigger value="elements">要素</TabsTrigger>
                  <TabsTrigger value="review">
                    批注 {openNotes > 0 ? openNotes : ""}
                  </TabsTrigger>
                  <TabsTrigger value="checks">检查</TabsTrigger>
                  <TabsTrigger value="search">查找</TabsTrigger>
                </TabsList>
                <TabsContent value="elements" className="sap-panel-content">
                  <section>
                    <h2>文档信息</h2>
                    <Field label="文档标题">
                      {(id) => (
                        <Input
                          id={id}
                          variant="sm"
                          maxLength={120}
                          value={draft.meta.title}
                          onChange={(event) =>
                            updateMeta("title", event.target.value)
                          }
                        />
                      )}
                    </Field>
                    <div className="sap-field-pair">
                      <Field label="方案编号">
                        {(id) => (
                          <Input
                            id={id}
                            variant="sm"
                            maxLength={80}
                            value={draft.meta.protocol}
                            onChange={(event) =>
                              updateMeta("protocol", event.target.value)
                            }
                          />
                        )}
                      </Field>
                      <Field label="文档版本">
                        {(id) => (
                          <Input
                            id={id}
                            variant="sm"
                            maxLength={40}
                            value={draft.meta.version}
                            onChange={(event) =>
                              updateMeta("version", event.target.value)
                            }
                          />
                        )}
                      </Field>
                    </div>
                    <Field label="编制团队（仅虚构）">
                      {(id) => (
                        <Input
                          id={id}
                          variant="sm"
                          maxLength={100}
                          value={draft.meta.sponsor}
                          onChange={(event) =>
                            updateMeta("sponsor", event.target.value)
                          }
                        />
                      )}
                    </Field>
                    <Field label="文档日期">
                      {(id) => (
                        <Input
                          id={id}
                          variant="sm"
                          type="date"
                          value={draft.meta.date}
                          onChange={(event) =>
                            updateMeta("date", event.target.value)
                          }
                        />
                      )}
                    </Field>
                  </section>
                  <Separator />
                  <section>
                    <div className="sap-section-heading">
                      <h2>SAP 组件库</h2>
                      <span>4 个区块</span>
                    </div>
                    <p className="sap-helper">
                      插入到当前光标处，内容可编辑、可撤销。
                    </p>
                    <div className="sap-insert-list">
                      {INSERTS.map((item) => (
                        <Button
                          key={item.id}
                          variant="outline"
                          size="md"
                          autoHeight
                          className="sap-insert"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            isolateHistory(editor, () => {
                              editor
                                .chain()
                                .focus()
                                .insertContent(item.build())
                                .run();
                            });
                            toast.success(`已插入${item.title}。`);
                          }}
                        >
                          <span className="sap-insert-icon">
                            {item.id === "tlf" || item.id === "endpoints" ? (
                              <Table2 />
                            ) : (
                              <ClipboardList />
                            )}
                          </span>
                          <span>
                            <strong>{item.title}</strong>
                            <small>{item.detail}</small>
                          </span>
                          <Plus />
                        </Button>
                      ))}
                    </div>
                  </section>
                  <Separator />
                  <section>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openGlossary()}
                    >
                      <BookOpen />
                      术语和缩略语 · {draft.terms.length}
                      <ChevronRight />
                    </Button>
                    <p className="sap-helper">维护定义，一键插入正文表格。</p>
                  </section>
                  <div className="sap-boundary-note">
                    <ShieldCheck />
                    <p>
                      仅为写作和结构审阅工具。
                      <br />
                      方法选择与内容须专业复核。
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="review" className="sap-panel-content">
                  <div className="sap-section-heading">
                    <h2>本地批注</h2>
                    <Button size="xs" variant="outline" onClick={addComment}>
                      <Plus />
                      新增
                    </Button>
                  </div>
                  <p className="sap-helper">
                    先选中文字再新增批注；随正文编辑保留锚点。仅本地单人审阅。
                  </p>
                  {draft.comments.length === 0 && (
                    <div className="sap-empty">
                      <MessageSquare />
                      <strong>让每一条意见有所指</strong>
                      <p>选中终点定义或分析方法，留下可定位的审阅意见。</p>
                    </div>
                  )}
                  {draft.comments.map((note, index) => {
                    const anchor = commentAnchor(editor.state.doc, note.id);
                    return (
                      <section
                        key={note.id}
                        className="sap-review-note"
                        data-status={note.status}
                      >
                        <div className="sap-section-heading">
                          <strong>
                            批注 {index + 1} ·{" "}
                            {note.status === "open" ? "待处理" : "已处理"}
                          </strong>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => toggleComment(note.id)}
                          >
                            {note.status === "open" ? (
                              <CheckCheck />
                            ) : (
                              <RotateCcw />
                            )}
                            {note.status === "open" ? "标记处理" : "重新打开"}
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="sap-anchor"
                          disabled={!anchor}
                          onClick={() => {
                            if (anchor) jumpTo(editor, anchor.from, anchor.to);
                          }}
                        >
                          {anchor
                            ? `“${anchor.text.slice(0, 65)}”`
                            : "锚点已删除 · 不再定位"}
                          {anchor && <ArrowDown />}
                        </Button>
                        <Textarea
                          aria-label={`编辑批注 ${index + 1}`}
                          maxLength={2000}
                          value={note.body}
                          onChange={(event) =>
                            setDraft((previous) => ({
                              ...previous,
                              comments: previous.comments.map((item) =>
                                item.id === note.id
                                  ? { ...item, body: event.target.value }
                                  : item,
                              ),
                            }))
                          }
                        />
                      </section>
                    );
                  })}
                </TabsContent>
                <TabsContent value="checks" className="sap-panel-content">
                  <div className="sap-check-summary">
                    <ShieldCheck />
                    <h2>
                      {issues.length
                        ? `${issues.length} 项待核对`
                        : "未发现预设结构问题"}
                    </h2>
                    <p>
                      覆盖 {foundSections}/{REQUIRED_SECTIONS.length}{" "}
                      个章节主题；随编辑实时更新。
                    </p>
                  </div>
                  <p className="sap-rule-warning">
                    仅检查章节关键词、必填元数据、待填标记、批注锚点与基础术语定义。
                    <strong>不验证统计方法、计算、临床适用性或合规性。</strong>
                  </p>
                  {issues.map((issue) => (
                    <Button
                      key={issue.id}
                      variant="outline"
                      size="md"
                      autoHeight
                      className="sap-issue"
                      onClick={() => {
                        if (issue.pos !== null) jumpTo(editor, issue.pos);
                        else if (issue.id.startsWith("note-"))
                          showPanel("review");
                        else if (issue.id.startsWith("term-")) openGlossary();
                        else {
                          showPanel("elements");
                          toast.info(
                            "缺失项没有正文锚点，请在方案信息或正文中补充相应内容。",
                          );
                        }
                      }}
                    >
                      <span>{issue.kind === "missing" ? "缺失" : "核对"}</span>
                      <span>{issue.text}</span>
                      <ChevronRight />
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toast.info(
                        `已重新检查：${issues.length} 项待核对；不含统计方法验证。`,
                      )
                    }
                  >
                    <RotateCcw />
                    重新检查
                  </Button>
                </TabsContent>
                <TabsContent value="search" className="sap-panel-content">
                  <h2>查找和替换</h2>
                  <p className="sap-helper">
                    不区分大小写的纯文本查找（最多 2000
                    处）；跨格式片段可匹配，不跨段落。
                  </p>
                  <Field label="查找文本">
                    {(id) => (
                      <Input
                        id={id}
                        data-sap-search
                        aria-label="查找文本"
                        value={query}
                        maxLength={200}
                        onChange={(event) => {
                          setQuery(event.target.value);
                          setMatchIndex(0);
                          editor.commands.setSearchTerm(event.target.value);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") findNext();
                        }}
                      />
                    )}
                  </Field>
                  <div className="sap-section-heading">
                    <span role="status">找到 {matches.length} 处匹配</span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!matches.length}
                      onClick={findNext}
                    >
                      下一处
                      <ArrowDown />
                    </Button>
                  </div>
                  <Field label="替换为">
                    {(id) => (
                      <Input
                        id={id}
                        value={replacement}
                        maxLength={500}
                        onChange={(event) => setReplacement(event.target.value)}
                      />
                    )}
                  </Field>
                  <div className="sap-control-row">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!matches.length}
                      onClick={() => replace(false)}
                    >
                      替换一处
                    </Button>
                    <Button
                      size="sm"
                      disabled={!matches.length}
                      onClick={() => replace(true)}
                    >
                      全部替换
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setQuery("");
                      editor.commands.setSearchTerm("");
                    }}
                  >
                    清除查找
                  </Button>
                </TabsContent>
              </Tabs>
            </aside>
          )}
        </main>
        <footer className="sap-statusbar">
          <div className="sap-control-row">
            <span>{outline.length} 个章节</span>
            <span>
              {editor.state.doc.textContent
                .replace(/\s/g, "")
                .length.toLocaleString("zh-CN")}{" "}
              字符
            </span>
            <span className="sap-status-boundary">连续纸张 · 无屏幕分页</span>
          </div>
          <div className="sap-control-row">
            <span className="sap-status-boundary">
              <ShieldCheck />
              本地演示 · 非受控文档
            </span>
            <Action
              label="缩小文档"
              onClick={() => setZoom((n) => Math.max(40, n - 10))}
            >
              <Minus />
            </Action>
            <Choice
              label="文档缩放"
              value={String(zoom)}
              options={[...new Set([40, 50, 65, 75, 85, 100, 125, 150, zoom])]
                .sort((a, b) => a - b)
                .map((n) => ({ value: String(n), label: `${n}%` }))}
              onChange={(value) => setZoom(Number(value))}
              className="sap-zoom-choice"
            />
            <Action
              label="放大文档"
              onClick={() => setZoom((n) => Math.min(150, n + 10))}
            >
              <Plus />
            </Action>
          </div>
        </footer>
        <input
          ref={fileInput}
          type="file"
          accept=".json,.html,.htm"
          aria-label="导入 SAP 文件"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void readFile(file);
          }}
        />
        <Dialog
          open={modal.kind !== "closed"}
          onOpenChange={(open) => {
            if (!open) setModal({ kind: "closed" });
          }}
        >
          <DialogContent
            className={
              modal.kind === "glossary" ? "sap-glossary-dialog" : undefined
            }
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>
                {modal.kind === "comment"
                  ? "新增文本批注"
                  : modal.kind === "reset"
                    ? "重置为虚构 SAP 模板？"
                    : modal.kind === "import"
                      ? "替换当前文档？"
                      : modal.kind === "glossary"
                        ? "术语和缩略语"
                        : "关于 SAP Studio 演示"}
              </DialogTitle>
              <DialogDescription>
                {modal.kind === "comment"
                  ? "批注锚定选中文字，保存在本浏览器。没有发送给其他人。"
                  : modal.kind === "reset" || modal.kind === "import"
                    ? "这将替换本页内容及本地草稿，并清除编辑撤销记录。建议先导出 JSON；取消不会更改文档。"
                    : modal.kind === "glossary"
                      ? "维护文档术语；插入表格后为可编辑快照，后续不会自动覆盖正文。"
                      : "基于 ReUI 与 Tiptap 的单人本地编辑演示，不属于 Word 官方产品。"}
              </DialogDescription>
            </DialogHeader>
            {modal.kind === "comment" && (
              <>
                <blockquote className="sap-quote">“{modal.quote}”</blockquote>
                <Field label="批注内容">
                  {(id) => (
                    <Textarea
                      id={id}
                      autoFocus
                      maxLength={2000}
                      value={noteText}
                      onChange={(event) => setNoteText(event.target.value)}
                      placeholder="例如：请补充主要终点分析窗和访视选取优先级。"
                    />
                  )}
                </Field>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setModal({ kind: "closed" })}
                  >
                    取消
                  </Button>
                  <Button disabled={!noteText.trim()} onClick={saveComment}>
                    保存批注
                  </Button>
                </DialogFooter>
              </>
            )}
            {(modal.kind === "reset" || modal.kind === "import") && (
              <>
                <p>
                  {modal.kind === "import"
                    ? `待导入文件：${modal.filename}`
                    : "将恢复演示内容、方案元数据、术语，并清空本地批注。全部内容均为虚构。"}
                </p>
                <DialogFooter>
                  <Button variant="outline" onClick={exportJson}>
                    先导出当前 JSON
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setModal({ kind: "closed" })}
                  >
                    取消
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      applyDraft(
                        modal.kind === "import" ? modal.draft : newDraft(),
                      )
                    }
                  >
                    确认替换
                  </Button>
                </DialogFooter>
              </>
            )}
            {modal.kind === "glossary" && (
              <>
                <div className="sap-glossary-list">
                  {draft.terms.map((term, index) => (
                    <div className="sap-glossary-row" key={index}>
                      <Input
                        aria-label={`缩略语 ${index + 1}`}
                        maxLength={30}
                        value={term.short}
                        onChange={(event) =>
                          setDraft((previous) => ({
                            ...previous,
                            terms: previous.terms.map((item, i) =>
                              i === index
                                ? { ...item, short: event.target.value }
                                : item,
                            ),
                          }))
                        }
                      />
                      <Input
                        aria-label={`术语定义 ${index + 1}`}
                        maxLength={200}
                        value={term.full}
                        onChange={(event) =>
                          setDraft((previous) => ({
                            ...previous,
                            terms: previous.terms.map((item, i) =>
                              i === index
                                ? { ...item, full: event.target.value }
                                : item,
                            ),
                          }))
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`删除术语 ${index + 1}`}
                        onClick={() =>
                          setDraft((previous) => ({
                            ...previous,
                            terms: previous.terms.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    disabled={draft.terms.length >= 100}
                    onClick={() =>
                      setDraft((previous) => ({
                        ...previous,
                        terms: [...previous.terms, { short: "", full: "" }],
                      }))
                    }
                  >
                    <Plus />
                    新增术语
                  </Button>
                  <Button
                    onClick={() => {
                      isolateHistory(editor, () => {
                        editor
                          .chain()
                          .focus()
                          .setTextSelection({ from: modal.from, to: modal.to })
                          .insertContent(
                            table([
                              ["缩略语", "完整定义"],
                              ...draft.terms.map((term) => [
                                term.short,
                                term.full,
                              ]),
                            ]),
                          )
                          .run();
                      });
                      setModal({ kind: "closed" });
                    }}
                  >
                    插入术语表
                  </Button>
                </DialogFooter>
              </>
            )}
            {modal.kind === "about" && (
              <div className="sap-about">
                <p>{DISCLAIMER}</p>
                <ul>
                  <li>
                    内容仅保存在本浏览器
                    localStorage，无账户、后端、上传或多用户协作。清理浏览器数据会丢失草稿，请导出
                    JSON 备份。
                  </li>
                  <li>
                    支持连续 A4
                    宽度编辑和浏览器真实打印分页；未实现屏幕动态分页、页码、页眉页脚控制或
                    DOCX 兼容承诺。
                  </li>
                  <li>
                    批注是本地文本锚定记录，不是审计追踪。没有修订追踪、签名、GxP
                    合规或统计分析执行。
                  </li>
                  <li>
                    JSON 保存完整本地状态；HTML
                    只导入/导出受支持的正文结构，移除脚本、链接和外部资源，不保证
                    Word HTML 无损。
                  </li>
                  <li>
                    快捷键：Ctrl/Cmd+B/I/U 格式、Z 撤销、F
                    查找；标题自动编号与左侧目录同步。查找为字面文本，不执行正则。
                  </li>
                </ul>
                <Button
                  variant="outline"
                  onClick={() => setModal({ kind: "closed" })}
                >
                  开始编辑
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RichTextProvider>
  );
}
