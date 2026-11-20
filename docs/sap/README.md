# SAP Studio：统计分析计划在线编辑演示

- **SAP 演示**：https://caovc.github.io/reactjs-tiptap-editor/sap/
- **原 Playground（保留）**：https://caovc.github.io/reactjs-tiptap-editor/
- 这是统计分析计划（Statistical Analysis Plan）写作工具，不是 SAP ERP，也不是 Word 官方产品。

## 现在可以做什么

1. **真实富文本**：开始 / 插入 / 布局 / 审阅功能区；标题 1–3、字体字号、粗体/斜体/下划线/删除线、文字颜色、突出显示、列表、对齐、撤销/重做。编辑器使用本仓库的扩展，不另造富文本引擎。
2. **连续纸张**：A4 宽度、15/20 mm 页边距、40%–150% 缩放；浏览器打印/另存 PDF 使用真实 A4 分页。屏幕是连续文档，没有用背景线伪造分页。
3. **活目录**：标题稳定 ID 与自动编号由同一 ProseMirror 插件生成，正文、目录与 JSON 一致；标题更改即时同步，点击定位编辑光标，支持多级标题。
4. **虚构 SAP 模板**：封面元数据、研究概述、目的、五要素估计目标、终点/分析集（FAS/PPS/SS）、样本量依据、主要/次要分析、缺失/敏感性、多重性/亚组、安全性、TLF 清单、数据处理与 QC 约定。12 个一级主题，含子标题；没有任何真实个人或患者数据。
5. **SAP 助手**：编辑方案标题、编号、版本、团队、日期；四个可编辑结构化区块（估计目标、终点分析表、TLF 表壳、缺失数据小节）在光标处插入；术语定义可增删编辑并插入正文表格。表格可加行/加列/删行/删表。
6. **规则检查**：实时检查 12 个章节关键词、标题跨级、必填方案信息、待填标记、缺失批注锚点、FAS/PPS/SS 术语定义。已有正文问题可跳转；缺失项提示补写位置。**只是结构规则，不验证统计方法、假设、样本量、结果、临床适用性或合规性。**
7. **文本锚定批注**：选中文字后新增，本地编辑意见、定位、标记已处理/重新打开；mark 随正文编辑映射，不保存易失效的绝对偏移。删除锚点会明确提示，不会猜测匹配到其他相似文字。当前不允许重叠批注；文本撤销不撤销审阅状态。
8. **本地持久化**：编辑后约 450ms 自动保存到当前浏览器 `localStorage`，刷新恢复正文/元数据/批注/术语/页边距。损坏草稿不静默覆盖；存储失败提示导出；其他标签页写入时暂停本页保存以避免覆盖未见变更。
9. **导入/导出**：JSON 保存完整状态；HTML 只保存受支持的正文结构，不含完整元数据/批注记录。导入先校验，确认后替换；取消或非法文件不改变当前文档。重置模板同样要求确认。

10. **真正块编辑**：空段落 `/` 搜索并以方向键/Enter 插入段落、标题、列表或安全 SAP 区块；hover 加号与 grip；菜单支持前后插入、上/下移动、段落/二级标题转换、重复/删除。grip 使用库的原生 HTML5 drag/drop，不是装饰图标；文本选区有 ReUI 浮动格式栏。键盘可用菜单移动作为拖拽替代。
11. **块与 SAP 联动**：重排保留章节 ID、自动编号和原有批注标记；重复会生成新的章节 ID，并移除副本上的旧审阅锚点，不让批注错误指向两个块。刷新恢复 JSON 结构，打印隐藏所有块工具。实测75%/100%/125%拖拽与撤销，75%窄屏菜单和选区定位。

## 数据与安全边界

- 单用户、无账户/后端/上传。代码不会上传文档；GitHub Pages 仍按正常静态托管机制接收页面/资源访问。清理浏览器数据、隐私模式退出或存储配额不足可能导致草稿丢失，请定期导出 JSON。
- `Zod` 白名单检查节点、属性、颜色、字体、尺寸与记录；ProseMirror `doc.check()` 检查 schema，`TableMap` 检查表格网格。文件最大 2 MB，限制嵌套层级/节点预算，单个表格最多 500 行 / 40 列；批注最多 200 条，术语最多 100 个。
- HTML 在解析前经 DOMPurify 的窄白名单处理：不接收脚本、事件、外链、图像、iframe 或未知嵌入。受支持样式仍要经过 JSON schema 白名单；不接受 arbitrary CSS。粘贴保留基本结构但移除样式/外部资源/批注 ID，避免未知标记带入。导入失败保留原文。
- 插入库使用 Tiptap JSON 节点与表格，不拼接不可信 HTML。查找/替换是纯文本；`<script>` 等替换值只插入文字。
- 纯演示专业写作环境，**请勿输入真实患者信息**。所有方法示例和数字是假设，不能用于真实研究决策，须由合格人员审阅。

## 没有实现 / 不承诺

- 没有屏幕动态分页、屏幕页码、自动重复页眉页脚、脚注/尾注、跨页复杂表格布局控制。
- 块拖拽以顶层文档块为单位；不提供表格内/嵌套列表项独立拖拽、多块框选或跨编辑器拖拽承诺。40%–150%缩放仍可选择，但本轮真实拖拽回归范围为75%/100%/125%，没有宣称所有比例与触摸设备均已覆盖。
- 没有 DOCX 导入导出兼容承诺；原 Playground 的功能未删除，但 SAP demo 只暴露已验证的 JSON/正文 HTML/浏览器 PDF 输出。
- 没有修订追踪、多人协作、联网批注、权限、真实身份、签名、审计追踪或 GxP 合规。
- 没有统计计算、数据分析、方法适用性判断、样本量计算器。TLF 是可编辑表壳，不是计算结果。
- 术语表插入后是正文快照，后续编辑术语不会自动覆盖已插入表格。
- 搜索不跨段落，不区分大小写，最多 2000 处；只做字面文本匹配，不执行正则。
- 本地审阅状态与正文历史分离；撤销新增批注标记会保留一条“锚点已删除”的审阅记录，重做可恢复锚点。
- 窄屏保留纸张排版，支持画布横向滚动、缩放与左右面板切换，不把固定纸张压成另一份手机文档。
- 打印包含封面与正文，不包含工具栏和侧栏批注；分页由浏览器完成，长表/字体可能因浏览器和系统字库不同而变化。

## ReUI 来源与架构

没有新增另一套 UI，也没有把自制控件冒称官方 ReUI。复用同一仓库官方 ReUI v1：原有 button、dialog、dropdown-menu、input、label、select、separator、tabs、textarea、toggle、tooltip、sonner，块浮层还使用本轮新增的官方 Card。全仓共18个家族，SAP不引入另一套UI。

来源为官方 `keenthemes/reui` v1 固定提交 `a98dda1432a74c2e3d6680887325f859eaa32cdf`，实现位于 `src/components/reui/`，许可证与来源见 [ReUI migration](../reui/MIGRATION.md)、[sources.json](../reui/sources.json)、[LICENSE](../reui/LICENSE.md)。用 `pnpm dlx shadcn@latest view @reui/...` 核对固定 registry；本轮全仓补全新增官方 Card / Alert / Slider，来源与适配记录已同步。

`controls.tsx` 的 Field / Choice / Action / Format / RibbonGroup、目录与方案助手均为本演示基于上述 primitives 组合的自定义组件；不会假称是官方 SAP 业务组件。77个 public entry 不变；本库公开主体是 RichTextProvider + 组合式扩展，并不存在可替换使用的单一 RichTextEditor 组件。SAP 的 EditorContent 位于同一 Provider 中，并装配同一公开 SlashCommandList、RichTextBubbleMenuDragHandle 和 RichTextBubbleText；不另造编辑引擎。共享块操作修复同步适用于原 Playground。Vite 以根 `index.html` 和 `sap/index.html` 双入口构建；两个入口共享库资产，SAP 样式只加载在 SAP 入口，Pages 的子路径 base 统一处理。

## 本地运行与验证

```sh
pnpm install --frozen-lockfile  # packageManager: pnpm@8.15.9
pnpm build:lib
pnpm --dir playground dev      # 打开 http://localhost:8000/sap/
pnpm type-check:sap
PAGES_BASE_PATH=/reactjs-tiptap-editor/ pnpm --dir playground build
pnpm exec playwright test tests/browser/sap.spec.ts tests/browser/sap-blocks.spec.ts
```

本轮测试、基线 CJS 问题、截图与实际线上验证见 [全仓验证](../reui/VALIDATION_COMPLETION.md)；[VALIDATION.md](VALIDATION.md) 保留前一轮 SAP 记录。设计 reference lock、Refero 订阅限制与 decision ledger 见 [DESIGN.md](DESIGN.md)。
