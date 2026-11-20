import fs from "node:fs";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const before = read("docs/reui/full-audit/baseline.json");
const after = read("docs/reui/full-audit/current.json");
const notes = read("docs/reui/full-audit/decisions.json");
const vendors = new Set(
  read("docs/reui/sources.json").map(
    (x) => `src/components/reui/${x.component}.tsx`,
  ),
);
const exemptions = read("scripts/reui/native-exceptions.json");
const byFile = new Map(before.map((x) => [x.file, { before: x }]));
for (const item of after)
  byFile.set(item.file, { ...byFile.get(item.file), after: item });
const escape = (v) => String(v).replaceAll("|", "\\|").replaceAll("\n", " ");
const tableRow = (v) => `| ${v.map(escape).join(" | ")} |`;
const controlTags = [
  "Button",
  "Toggle",
  "Input",
  "Textarea",
  "Select",
  "Slider",
  "Checkbox",
  "Switch",
  "Dialog",
  "Popover",
  "DropdownMenu",
  "Tabs",
  "Tooltip",
  "Alert",
  "Card",
  "ActionButton",
  "ActionMenuButton",
  "ColorPicker",
  "EmojiPicker",
  "RichText",
];
function composition(entry) {
  if (!entry) return "已删除；不是保留旧源码的重命名目录";
  const tags = Object.keys(entry.jsx).filter((tag) =>
    controlTags.some((prefix) => tag.startsWith(prefix)),
  );
  if (tags.length) return tags.join(", ");
  const imports = entry.imports.filter(
    (i) =>
      i.includes("/reui") ||
      i.includes("ActionButton") ||
      i.includes("ActionMenuButton"),
  );
  if (imports.length) return imports.join(", ");
  if (entry.documentSchema)
    return "文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供";
  if (entry.domSinks.length)
    return "必要的文档/导出/媒体 DOM；见原生及外部引擎边界";
  if (Object.keys(entry.jsx).length)
    return "语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合";
  return "非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换";
}
function oldSummary(entry) {
  if (!entry) return "新增";
  const counts = {};
  for (const f of entry.findings) counts[f.kind] = (counts[f.kind] || 0) + 1;
  return Object.keys(counts).length
    ? Object.entries(counts)
        .map(([k, v]) => `${k}×${v}`)
        .join("; ")
    : entry.documentSchema
      ? "文档 schema / nodeview 注册"
      : Object.keys(entry.jsx).length
        ? "既有语义节点 / 共享组件组合"
        : "非交互代码";
}
const rows = [...byFile]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([file, entry]) => {
    const note = notes[file];
    const native = exemptions.filter((x) => x.file === file);
    const state = !entry.before
      ? "新增"
      : !entry.after
        ? "删除"
        : entry.before.sha256 === entry.after.sha256
          ? "已审计，未改动"
          : "已改（含格式化/直接引用整理）";
    return tableRow([
      `\`${file}\``,
      note?.role ||
        (file.startsWith("src/extensions/")
          ? `${file.split("/")[2]} 插件`
          : file.includes("/icons/")
            ? "SVG / 图标资产"
            : file.startsWith("playground/src/sap/")
              ? "SAP 文档工作台"
              : file.startsWith("src/components/")
                ? "编辑器共享组件"
                : file.startsWith("src/hooks/")
                  ? "共享 hooks"
                  : "编辑器模块"),
      note?.before || oldSummary(entry.before),
      note?.after || composition(entry.after),
      `${state}${vendors.has(file) ? "；官方 ReUI vendored" : ""}${native.length ? `；${native.length} 个精确原生例外` : ""}`,
      note?.evidence ||
        (native.length
          ? "精确源节点与理由：native-exceptions.json；交互覆盖仅限 VALIDATION_COMPLETION.md 列项"
          : vendors.has(file)
            ? "固定 registry 原始 SHA；控件/插件浏览器用例覆盖部分 API"
            : entry.after && Object.keys(entry.after.jsx).length
              ? "静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖"
              : "全源 AST / 类型 / 导出门禁；非逐功能运行证明"),
    ]);
  });
const count = (list, kind) =>
  list
    .filter((x) => !vendors.has(x.file))
    .flatMap((x) => x.findings)
    .filter((x) => x.kind === kind).length;
const body = `# 全仓 ReUI 文件级审计与映射（当前）\n\n> 更正：第一轮只替换基础组件，不足以宣称全仓迁移。本报告覆盖 src 与 playground/src **所有 TS/TSX/JS/JSX 文件**，而不是仅查 shadcn 名称。每行均给出旧实现、当前组合/边界、变更类型及证据等级；静态通过不等于所有插件分支运行通过。\n\n> 后续视觉纠正：[样式与定位根因、几何验收](STYLE_POSITION_FIX.md)。此前功能通过并不代表视觉正确；另用实际 Tailwind 编译器校验 [utility-current.json](full-audit/utility-current.json)，不以 import 盘点代替 CSS 生成证明。\n\n- 基线：旧 main 01db11df5b7ac42fe2499b41b9a7961fdeb44319；${before.length} 源模块，${before.filter((x) => Object.keys(x.jsx).length).length} 个含 JSX 文件。\n- 当前：${after.length} 源模块，${after.filter((x) => Object.keys(x.jsx).length).length} 个含 JSX 文件；18 个官方 ReUI 家族。\n- 旧/新路径并集：${byFile.size}；变更路径 ${[...byFile.values()].filter((x) => x.before?.sha256 !== x.after?.sha256).length}（包括删除、新增、纯引用/格式整理，不等于重写组件数）。\n- 业务原生控件候选：${count(before, "native-control")} → ${count(after, "native-control")}（最终均为7个隐藏 file input）；业务直接 Radix：${count(before, "direct-radix")} → ${count(after, "direct-radix")}；旧 UI 目录引用：${count(before, "legacy-ui-import")} → ${count(after, "legacy-ui-import")}；原生交互候选：${count(before, "native-interaction")} → ${count(after, "native-interaction")}。\n- 当前业务例外 ${exemptions.length} 个精确节点：7 个隐藏文件桥、4 个媒体文档选中面、4 个缩放手柄、1 个表格 pointer-capture 容器。没有业务原生 button/select/textarea/range，且没有未批准候选。ReUI 内部原生 DOM / Radix 正常保留。\n- 不把业务词汇、React 布局 div、ProseMirror contentDOM 或 SVG 改名为 ReUI。旧目录18个文件完整移除；通知 API 移入 notifications.ts，emoji 的搜索/选项真实由 ReUI 提供，Frimousse 仅保留数据/导航/虚拟化引擎。\n\n## 可重复检查\n\n\`pnpm audit:ui\` 生成 current.json、执行样式编译契约并校验逐节点例外、官方来源路径与77个公开 export entry/typesVersions 快照；\`pnpm test:unit\` 包含10个反例/正例门禁测试；\`node scripts/reui/report.mjs\` 重建此表。\n\n完整 AST、事件、DOM sinks、文件 SHA：\`full-audit/baseline.json\` 与 \`full-audit/current.json\`。基线只读，不得重建覆盖。例外不能通过忽略目录消失；未用例外也会使检查失败。\n\n## 逐文件记录\n\n| 路径 | 作用 | 旧实现 | 当前 ReUI 对应 / 组合 / 原生边界 | 状态 | 验证证据（不夸大） |\n| --- | --- | --- | --- | --- | --- |\n${rows.join("\n")}\n`;
const supportBefore = new Map(
  read("docs/reui/full-audit/style-baseline.json").map((x) => [x.file, x]),
);
const supports = read("docs/reui/full-audit/style-current.json");
const supportTable =
  "\n## 样式、HTML 与构建/发布入口（单独全量盘点）\n\n这些不是 JSX 控件，单独记录避免被源码数量掩盖。原始/当前文件 SHA 在 style-baseline.json / style-current.json；不把静态 hash 说成运行覆盖。\n\n| 路径 | 作用 | 变化 | 核验 |\n| --- | --- | --- | --- |\n" +
  supports
    .map((x) =>
      tableRow([
        `\`${x.file}\``,
        x.role,
        supportBefore.get(x.file)?.sha256 === x.sha256
          ? "已审阅，未改动"
          : "已改",
        x.evidence,
      ]),
    )
    .join("\n") +
  "\n";
fs.writeFileSync("docs/reui/FULL_AUDIT.md", body + supportTable);
console.log(`Wrote ${byFile.size} file-level mappings`);
