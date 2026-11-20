import { generateJSON } from '@tiptap/core';
import { TableMap } from '@tiptap/pm/tables';
import DOMPurify from 'dompurify';
import { z } from 'zod';

import { DEFAULT_META, DEFAULT_TERMS, initialDocument, REQUIRED_SECTIONS } from './document';
import { commentAnchor, getOutline } from './extensions';

import type { Editor, JSONContent } from '@tiptap/core';

export const STORAGE_KEY = 'reui-sap-studio:v1';
const nullable = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === '' ? null : value), schema.nullable().optional());
const color = z.string().regex(/^(#[a-f\d]{3,8}|rgb\(\d{1,3}, ?\d{1,3}, ?\d{1,3}\))$/i);
const attrsSchema = z.strictObject({
  level: z.number().int().min(1).max(3).optional(),
  align: nullable(z.enum(['left', 'center', 'right', 'justify'])),
  textAlign: nullable(z.enum(['left', 'center', 'right', 'justify'])),
  sapId: nullable(z.string().regex(/^sap-[a-zA-Z0-9-]{1,80}$/)),
  sectionNumber: z
    .string()
    .regex(/^[\d.]*$/)
    .max(20)
    .optional(),
  start: z.number().int().min(1).max(10000).optional(),
  type: nullable(z.string().regex(/^[1aAiI]$/)),
  colspan: z.number().int().min(1).max(20).optional(),
  rowspan: z.number().int().min(1).max(100).optional(),
  colwidth: nullable(z.array(z.number().int().min(20).max(2000)).max(20)),
  backgroundColor: nullable(color),
  fontSize: nullable(z.string().regex(/^(?:[8-9]|[12]\d|3[0-6])(?:px|pt)$/)),
  fontFamily: nullable(z.enum(['Arial', 'Times New Roman', 'SimSun', 'serif', 'sans-serif'])),
  color: nullable(color),
  id: nullable(z.string().regex(/^note-[a-zA-Z0-9-]{1,80}$/)),
});
const markSchema = z.strictObject({
  type: z.enum(['bold', 'italic', 'underline', 'strike', 'textStyle', 'highlight', 'sapComment']),
  attrs: attrsSchema.optional(),
});
const nodeSchema = z.strictObject({
  type: z.enum([
    'doc',
    'paragraph',
    'text',
    'heading',
    'hardBreak',
    'bulletList',
    'orderedList',
    'listItem',
    'table',
    'tableRow',
    'tableCell',
    'tableHeader',
  ]),
  attrs: attrsSchema.optional(),
  text: z.string().min(1).max(200000).optional(),
  marks: z.array(markSchema).max(10).optional(),
  get content() {
    return z.array(nodeSchema).max(5000).optional();
  },
});
const metaSchema = z.strictObject({
  title: z.string().max(120),
  protocol: z.string().max(80),
  version: z.string().max(40),
  sponsor: z.string().max(100),
  date: z.string().max(20),
});
const noteSchema = z.strictObject({
  id: z.string().regex(/^note-[a-zA-Z0-9-]{1,80}$/),
  body: z.string().max(2000),
  status: z.enum(['open', 'resolved']),
});
export const draftSchema = z.strictObject({
  version: z.literal(1),
  meta: metaSchema,
  comments: z.array(noteSchema).max(200),
  terms: z.array(z.strictObject({ short: z.string().max(30), full: z.string().max(200) })).max(100),
  margin: z.enum(['normal', 'narrow']),
  doc: nodeSchema,
});
// Editor-owned state follows Tiptap's schema; external files are narrowed by draftSchema at the boundary.
export type Draft = Omit<z.infer<typeof draftSchema>, 'doc'> & { doc: JSONContent };
export type ReviewNote = z.infer<typeof noteSchema>;
export type Metadata = z.infer<typeof metaSchema>;
export function newDraft(): Draft {
  return draftSchema.parse({
    version: 1,
    meta: DEFAULT_META,
    comments: [],
    terms: DEFAULT_TERMS,
    margin: 'normal',
    doc: initialDocument(),
  });
}
function guardSize(value: unknown, depth = 0, budget = { count: 0 }) {
  if (depth > 35 || ++budget.count > 50000)
    throw new Error('文档过于复杂（最多 35 层 / 50000 个值）。');
  if (value && typeof value === 'object')
    for (const child of Object.values(value)) guardSize(child, depth + 1, budget);
}
export function parseDraft(value: unknown, editor?: Pick<Editor, 'schema'>): Draft {
  guardSize(value);
  const result = draftSchema.safeParse(value);
  if (!result.success)
    throw new Error(
      `文件格式不受支持：需要 SAP Studio v1 JSON，且只能包含受支持的节点、属性和样式。${result.error.issues
        .slice(0, 3)
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('；')}`
    );
  const draft = result.data;
  if (draft.doc.type !== 'doc') throw new Error('正文根节点必须是 doc。');
  if (new Set(draft.comments.map((c) => c.id)).size !== draft.comments.length)
    throw new Error('批注标识重复。');
  if (editor) {
    const doc = editor.schema.nodeFromJSON(draft.doc);
    doc.check();
    doc.descendants((node) => {
      if (node.type.name === 'table') {
        let maxColumns = 0;
        node.forEach((row) => {
          let columns = 0;
          row.forEach((cell) => {
            columns += Number(cell.attrs.colspan) || 1;
          });
          maxColumns = Math.max(maxColumns, columns);
        });
        if (node.childCount > 500 || maxColumns > 40)
          throw new Error('单个表格最多支持 500 行、40 列。');
        if (TableMap.get(node).problems?.length)
          throw new Error('表格行列结构不完整，请修复后导入。');
      }
      for (const mark of node.marks)
        if (mark.type.name === 'sapComment') {
          const note = draft.comments.find((c) => c.id === mark.attrs.id);
          if (!note) throw new Error('批注锚点与审阅记录不一致。');
        }
    });
  }
  return draft;
}
export function loadDraft(): { draft: Draft; error: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && raw.length > 2_000_000) throw new Error('草稿超过 2 MB。');
    return { draft: raw ? parseDraft(JSON.parse(raw)) : newDraft(), error: null };
  } catch {
    return {
      draft: newDraft(),
      error:
        '无法恢复原草稿；已打开演示副本并暂停保存，原草稿未覆盖。请先备份浏览器数据，或确认重置模板。',
    };
  }
}
const htmlTags = [
  'p',
  'br',
  'h1',
  'h2',
  'h3',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'span',
  'mark',
  'ul',
  'ol',
  'li',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'colgroup',
  'col',
];
function cleanImportedHtml(text: string) {
  const purifier = DOMPurify(window);
  const allowedStyles = {
    'text-align': z.enum(['left', 'center', 'right', 'justify']),
    'font-size': z.string().regex(/^(?:[8-9]|[12]\d|3[0-6])(?:px|pt)$/),
    'font-family': z.enum(['Arial', 'Times New Roman', 'SimSun', 'serif', 'sans-serif']),
    color,
    'background-color': color,
  };
  purifier.addHook('uponSanitizeAttribute', (_node, data) => {
    if (data.attrName !== 'style') return;
    data.attrValue = data.attrValue
      .split(';')
      .flatMap((declaration) => {
        const split = declaration.indexOf(':');
        const name = declaration.slice(0, split).trim().toLowerCase();
        const value = declaration
          .slice(split + 1)
          .trim()
          .replace(/^['"]|['"]$/g, '');
        if (!(name in allowedStyles)) return [];
        const rule = Object.entries(allowedStyles).find(([key]) => key === name)?.[1];
        return rule?.safeParse(value).success ? [`${name}:${value}`] : [];
      })
      .join(';');
    if (!data.attrValue) data.keepAttr = false;
  });
  return purifier.sanitize(text, {
    ALLOWED_TAGS: htmlTags,
    ALLOWED_ATTR: ['style', 'colspan', 'rowspan', 'colwidth', 'start'],
    ALLOW_DATA_ATTR: false,
  });
}
export function importHtml(text: string, current: Draft, editor: Editor): Draft {
  const clean = cleanImportedHtml(text);
  const doc: JSONContent = generateJSON(clean, editor.extensionManager.extensions);
  return parseDraft({ ...current, doc, comments: [] }, editor);
}
export function safePastedHtml(html: string) {
  // Paste accepts structural text/table markup, not imported CSS, links, external resources or comment IDs.
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: htmlTags,
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
  });
}
export function download(name: string, text: string, mime: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export type Issue = { id: string; text: string; pos: number | null; kind: 'missing' | 'review' };
export function checkDocument(editor: Editor, draft: Draft): Issue[] {
  const outline = getOutline(editor.state.doc);
  const issues: Issue[] = REQUIRED_SECTIONS.filter(
    (title) => !outline.some((item) => item.text.includes(title))
  ).map((title) => ({
    id: `section-${title}`,
    text: `缺少章节：${title}`,
    pos: null,
    kind: 'missing',
  }));
  let previousLevel = 0;
  for (const item of outline) {
    if (item.level > previousLevel + 1)
      issues.push({
        id: `heading-level-${item.id}`,
        text: `标题跨级：${item.text}（应先设置上一级标题）`,
        pos: item.pos + 1,
        kind: 'review',
      });
    previousLevel = item.level;
  }
  if (!draft.meta.protocol.trim() || !draft.meta.title.trim() || !draft.meta.version.trim())
    issues.push({
      id: 'meta',
      text: '方案编号、文档标题及版本不能为空。',
      pos: null,
      kind: 'missing',
    });
  editor.state.doc.descendants((node, pos) => {
    if (node.isTextblock && /【待|待填写|待补充/.test(node.textContent))
      issues.push({
        id: `placeholder-${pos}`,
        text: `待完善：${node.textContent.slice(0, 65)}…`,
        pos: pos + 1,
        kind: 'review',
      });
  });
  for (const note of draft.comments)
    if (!commentAnchor(editor.state.doc, note.id))
      issues.push({
        id: note.id,
        text: `批注锚点已删除：${note.body.slice(0, 30)}`,
        pos: null,
        kind: 'review',
      });
  for (const term of ['FAS', 'PPS', 'SS'])
    if (!draft.terms.some((t) => t.short === term && t.full.trim()))
      issues.push({
        id: `term-${term}`,
        text: `术语表缺少 ${term} 的定义。`,
        pos: null,
        kind: 'missing',
      });
  return issues;
}
