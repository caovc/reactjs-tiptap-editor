# 全仓 ReUI 文件级审计与映射（当前）

> 更正：第一轮只替换基础组件，不足以宣称全仓迁移。本报告覆盖 src 与 playground/src **所有 TS/TSX/JS/JSX 文件**，而不是仅查 shadcn 名称。每行均给出旧实现、当前组合/边界、变更类型及证据等级；静态通过不等于所有插件分支运行通过。

- 基线：旧 main 01db11df5b7ac42fe2499b41b9a7961fdeb44319；356 源模块，154 个含 JSX 文件。
- 当前：345 源模块，157 个含 JSX 文件；18 个官方 ReUI 家族。
- 旧/新路径并集：363；变更路径 85（包括删除、新增、纯引用/格式整理，不等于重写组件数）。
- 业务原生控件候选：68 → 7（最终均为7个隐藏 file input）；业务直接 Radix：4 → 0；旧 UI 目录引用：42 → 0；原生交互候选：20 → 9。
- 当前业务例外 16 个精确节点：7 个隐藏文件桥、4 个媒体文档选中面、4 个缩放手柄、1 个表格 pointer-capture 容器。没有业务原生 button/select/textarea/range，且没有未批准候选。ReUI 内部原生 DOM / Radix 正常保留。
- 不把业务词汇、React 布局 div、ProseMirror contentDOM 或 SVG 改名为 ReUI。旧目录18个文件完整移除；通知 API 移入 notifications.ts，emoji 的搜索/选项真实由 ReUI 提供，Frimousse 仅保留数据/导航/虚拟化引擎。

## 可重复检查

`pnpm audit:ui` 生成 current.json 并校验逐节点例外、官方来源路径与77个公开 export entry/typesVersions 快照；`pnpm test:unit` 包含10个反例/正例门禁测试；`node scripts/reui/report.mjs` 重建此表。

完整 AST、事件、DOM sinks、文件 SHA：`full-audit/baseline.json` 与 `full-audit/current.json`。基线只读，不得重建覆盖。例外不能通过忽略目录消失；未用例外也会使检查失败。

## 逐文件记录

| 路径 | 作用 | 旧实现 | 当前 ReUI 对应 / 组合 / 原生边界 | 状态 | 验证证据（不夸大） |
| --- | --- | --- | --- | --- | --- |
| `playground/src/App.tsx` | 原Playground主体/设置/输出 | 原生设置按钮、range、textarea，样式脱离ReUI边界 | 官方 ReUI Card/Header/Content 编辑器主体壳 + 真正 Button/Slider/Textarea；清除未作用的旧未前缀样式，HTML输出参加theme/reset | 已改（含格式化/直接引用整理） | tests/browser/playground.spec.ts / controls.spec.ts；原Playground所有现有交互回归 |
| `playground/src/components/Hello/Hello.tsx` | 编辑器模块 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `playground/src/emojis.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `playground/src/main.tsx` | 编辑器模块 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `playground/src/sap/blocks.tsx` | SAP块编辑插件装配 | SAP先前未装配库slash/drag/selection bubble | 同一公开SlashCommandList/DragHandle/Bubble + ReUI Card/Button；Chinese slash/SAP安全JSON插入、复制剥离锚定批注/章节ID | 新增 | tests/browser/sap-blocks.spec.ts全部7条（其中3种zoom原生drag） |
| `playground/src/sap/controls.tsx` | SAP 文档工作台 | 既有语义节点 / 共享组件组合 | Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem, Tooltip, TooltipTrigger, Button, TooltipContent, Toggle | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `playground/src/sap/document.ts` | SAP 文档工作台 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `playground/src/sap/editor.ts` | SAP schema与扩展 | 已有安全schema与编号/批注，缺少slash扩展 | 加入公共SlashCommand，不造第二套节点模型；现有schema导入校验仍在 | 已改（含格式化/直接引用整理） | SAP导入安全/ID/批注全部既有回归；tests/browser/sap-blocks.spec.ts |
| `playground/src/sap/extensions.ts` | SAP 文档工作台 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `playground/src/sap/main.tsx` | SAP 文档工作台 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `playground/src/sap/model.ts` | SAP 文档工作台 | 非交互代码 | 必要的文档/导出/媒体 DOM；见原生及外部引擎边界 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `playground/src/sap/SapApp.tsx` | Word式工作台集成 | 公开Provider + EditorContent但未挂载块能力 | 保留Word功能区，同时装配真正库SapBlockTools；仍使用本库公开Provider（本库没有单一RichTextEditor组件）；修复桌面缩小后两侧面板同时遮住画布（matchMedia关闭，仍可手动展开） | 已改（含格式化/直接引用整理）；1 个精确原生例外 | sap.spec.ts 13条 + sap-blocks.spec.ts 7条；保存、目录、批注、打印 |
| `playground/src/types/env.d.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `playground/src/types/global.d.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `playground/src/vite-env.d.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/bubble.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/ActionButton.tsx` | 主体/工具栏/插件共享动作 | 业务直接 Radix Slot + ReUI Toggle 分支，原生 drag mousedown 被阻止 | 统一真实 ReUI Toggle（含 asChild），保留 pressed/ref/选择区；拖拽允许原生 mousedown | 已改（含格式化/直接引用整理） | tests/browser/playground.spec.ts / controls.spec.ts；SAP 真拖拽75/100/125% |
| `src/components/ActionMenuButton.tsx` | 主体菜单触发器 | 业务层直接 Radix Slot | ReUI Button（含 asChild），过滤业务 props，不再泄漏到 DOM；保留注入的 click/action | 已改（含格式化/直接引用整理） | tests/browser/playground.spec.ts / controls.spec.ts；插件下拉/Popover |
| `src/components/Bubble/formatBubble.ts` | 编辑器共享组件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/Bubble/index.ts` | 编辑器共享组件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/Bubble/RichTextAIImprove.tsx` | 编辑器共享组件 | legacy-ui-import×1 | DropdownMenu, DropdownMenuTrigger, ActionButton, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator | 已改（含格式化/直接引用整理） | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/Bubble/RichTextBubbleCallout.tsx` | 插件浮动工具条 | 自制 border/bg/shadow 浮层 + 已有共享动作 | 官方 ReUI Card 负责表面；内部复用 ReUI 控件/共享动作 | 已改（含格式化/直接引用整理） | 全源/类型/构建；仅 VALIDATION_COMPLETION.md 列明场景实际浏览器覆盖，未逐媒体/每个按钮穷举 |
| `src/components/Bubble/RichTextBubbleCodeBlock.tsx` | 代码语言浮层 | div点击选项与旧UI路径 | 官方 ReUI Card 浮层 + Popover/按钮语言项；代码语法引擎保留 | 已改（含格式化/直接引用整理） | 静态/类型/构建；existing lazy/toolbar部分覆盖，不声称所有语言逐一测试 |
| `src/components/Bubble/RichTextBubbleColumns.tsx` | 插件浮动工具条 | 自制 border/bg/shadow 浮层 + 已有共享动作 | 官方 ReUI Card 负责表面；内部复用 ReUI 控件/共享动作 | 已改（含格式化/直接引用整理） | 全源/类型/构建；仅 VALIDATION_COMPLETION.md 列明场景实际浏览器覆盖，未逐媒体/每个按钮穷举 |
| `src/components/Bubble/RichTextBubbleDrawer.tsx` | 插件浮动工具条 | 自制 border/bg/shadow 浮层 + 已有共享动作 | 官方 ReUI Card 负责表面；内部复用 ReUI 控件/共享动作 | 已改（含格式化/直接引用整理） | 全源/类型/构建；仅 VALIDATION_COMPLETION.md 列明场景实际浏览器覆盖，未逐媒体/每个按钮穷举 |
| `src/components/Bubble/RichTextBubbleExcalidraw.tsx` | 插件浮动工具条 | 自制 border/bg/shadow 浮层 + 已有共享动作 | 官方 ReUI Card 负责表面；内部复用 ReUI 控件/共享动作 | 已改（含格式化/直接引用整理） | 全源/类型/构建；仅 VALIDATION_COMPLETION.md 列明场景实际浏览器覆盖，未逐媒体/每个按钮穷举 |
| `src/components/Bubble/RichTextBubbleIframe.tsx` | 插件浮动工具条 | 自制 border/bg/shadow 浮层 + 已有共享动作 | 官方 ReUI Card 负责表面；内部复用 ReUI 控件/共享动作 | 已改（含格式化/直接引用整理） | 全源/类型/构建；仅 VALIDATION_COMPLETION.md 列明场景实际浏览器覆盖，未逐媒体/每个按钮穷举 |
| `src/components/Bubble/RichTextBubbleKatex.tsx` | 插件浮动工具条 | 自制 border/bg/shadow 浮层 + 已有共享动作 | 官方 ReUI Card 负责表面；内部复用 ReUI 控件/共享动作 | 已改（含格式化/直接引用整理） | 全源/类型/构建；仅 VALIDATION_COMPLETION.md 列明场景实际浏览器覆盖，未逐媒体/每个按钮穷举 |
| `src/components/Bubble/RichTextBubbleLink.tsx` | 插件浮动工具条 | 自制 border/bg/shadow 浮层 + 已有共享动作 | 官方 ReUI Card 负责表面；内部复用 ReUI 控件/共享动作 | 已改（含格式化/直接引用整理） | 全源/类型/构建；仅 VALIDATION_COMPLETION.md 列明场景实际浏览器覆盖，未逐媒体/每个按钮穷举 |
| `src/components/Bubble/RichTextBubbleMedia.tsx` | 插件浮动工具条 | 自制 border/bg/shadow 浮层 + 已有共享动作 | 官方 ReUI Card 负责表面；内部复用 ReUI 控件/共享动作 | 已改（含格式化/直接引用整理） | 全源/类型/构建；仅 VALIDATION_COMPLETION.md 列明场景实际浏览器覆盖，未逐媒体/每个按钮穷举 |
| `src/components/Bubble/RichTextBubbleMenuDragHandle.tsx` | 共享块级操作与真正拖拽 | 菜单仅部分动作；hover偷focus；空段落slash位置错误；缩放时drag重新命中错误 | ReUI Popover/Button/Separator + 官方Tiptap DragHandle：顶层块规则使用当前文档位置，前后插入/移动/转换/重复/删除，原生drag不被preventDefault吞掉 | 已改（含格式化/直接引用整理） | tests/browser/sap-blocks.spec.ts：75/100/125真拖拽与撤销、移动/转换/重复/删除、ID批注稳定；嵌套子块拖拽未开放 |
| `src/components/Bubble/RichTextBubbleMermaid.tsx` | 插件浮动工具条 | 自制 border/bg/shadow 浮层 + 已有共享动作 | 官方 ReUI Card 负责表面；内部复用 ReUI 控件/共享动作 | 已改（含格式化/直接引用整理） | 全源/类型/构建；仅 VALIDATION_COMPLETION.md 列明场景实际浏览器覆盖，未逐媒体/每个按钮穷举 |
| `src/components/Bubble/RichTextBubbleTable.tsx` | 插件浮动工具条 | 自制 border/bg/shadow 浮层 + 已有共享动作 | 官方 ReUI Card 负责表面；内部复用 ReUI 控件/共享动作 | 已改（含格式化/直接引用整理） | 全源/类型/构建；仅 VALIDATION_COMPLETION.md 列明场景实际浏览器覆盖，未逐媒体/每个按钮穷举 |
| `src/components/Bubble/RichTextBubbleText.tsx` | 文本选区Bubble/段落转换 | 段落选项div点击；受缩放容器影响的浮层 | ReUI Button 段落项 + Popover；默认 Card 浮层固定挂body、shift定位并参加theme/reset | 已改（含格式化/直接引用整理） | tests/browser/sap-blocks.spec.ts：75%窄屏选区加粗；原Playground格式菜单 |
| `src/components/Bubble/RichTextBubbleTwitter.tsx` | 插件浮动工具条 | 自制 border/bg/shadow 浮层 + 已有共享动作 | 官方 ReUI Card 负责表面；内部复用 ReUI 控件/共享动作 | 已改（含格式化/直接引用整理） | 全源/类型/构建；仅 VALIDATION_COMPLETION.md 列明场景实际浏览器覆盖，未逐媒体/每个按钮穷举 |
| `src/components/ColorPicker.tsx` | 颜色/最近色/自定义颜色 | react-colorful UI、直接 Radix、div/span点击色块 | ReUI Popover/Button + RGB Slider + 校验 hex Input；删除 react-colorful 依赖 | 已改（含格式化/直接引用整理） | tests/browser/plugin-ui.spec.ts：颜色、RGB键盘、hex校验、最近色、取消 |
| `src/components/EmojiPicker.tsx` | 表情面板 | 旧 ui/emoji-picker 的原生按钮、Frimousse Search输入样式适配 | ReUI Button（类别/表情项）、Input asChild 真实搜索控件；Frimousse 保留数据/过滤/虚拟化/导航引擎 | 新增 | tests/browser/plugin-ui.spec.ts：搜索/样式、短码；existing lazy emoji |
| `src/components/icons/AspectRatio.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/Blockquote.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/CodeView.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/ColumnAddLeft.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/ColumnAddRight.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/DeleteColumn.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/DeleteRow.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/Direction.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/Excalidraw.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/ExportMarkdown.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/ExportPdf.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/ExportWord.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/FileWordOutline.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/GIfIcon.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/Html.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/Icon.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/IconColorFill.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/IconHighlightFill.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/icons.ts` | SVG / 图标资产 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/icons/ImportWord.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/index.ts` | SVG / 图标资产 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/icons/LeftToRight.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/LineHeight.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/MenuDown.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/Mermaid.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/NoFill.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/RightToLeft.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/SizeL.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/SizeM.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/SizeS.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/icons/Twitter.tsx` | SVG / 图标资产 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/index.ts` | 编辑器共享组件 | 非交互代码 | ./ActionButton, ./ActionMenuButton, ./reui | 已改（含格式化/直接引用整理） | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/LazyContent.tsx` | 延迟加载/失败重试 | 原生button重试 | ReUI Button，保留错误边界和重试状态 | 已改（含格式化/直接引用整理） | 静态/类型/构建；成功lazy路径测试；未逐一网络故障注入 |
| `src/components/notifications.ts` | 通知API（不是新UI系统） | ui/toast.ts + use-toast.ts，最终Sonner渲染 | 通知函数/类型原样迁入独立业务helper；渲染仍是官方ReUI Sonner | 新增 | Playground非法上传真实通知；类型导出一致 |
| `src/components/ReactBus.tsx` | 编辑器共享组件 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/reui/alert.tsx` | 编辑器共享组件 | 新增 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 新增；官方 ReUI vendored | 固定 registry 原始 SHA；控件/插件浏览器用例覆盖部分 API |
| `src/components/reui/button.tsx` | 编辑器共享组件 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动；官方 ReUI vendored | 固定 registry 原始 SHA；控件/插件浏览器用例覆盖部分 API |
| `src/components/reui/card.tsx` | 官方浮层/面板表面原语 | 新引入官方ReUI v1 Card | 固定commit官方源码；React18 forwardRef适配使建议列表的DOM ref真实可用 | 新增；官方 ReUI vendored | slash/mention/emoji/短语滚动与键盘；主体/插件/selection bubble回归 |
| `src/components/reui/checkbox.tsx` | 编辑器共享组件 | 既有语义节点 / 共享组件组合 | CheckboxPrimitive.Root, CheckboxPrimitive.Indicator | 已审计，未改动；官方 ReUI vendored | 固定 registry 原始 SHA；控件/插件浏览器用例覆盖部分 API |
| `src/components/reui/dialog.tsx` | 编辑器共享组件 | 既有语义节点 / 共享组件组合 | DialogPrimitive.Root, DialogPrimitive.Trigger, DialogPrimitive.Portal, DialogPrimitive.Close, DialogPrimitive.Overlay, DialogPortal, DialogOverlay, DialogPrimitive.Content, DialogClose, DialogPrimitive.Title, DialogPrimitive.Description | 已审计，未改动；官方 ReUI vendored | 固定 registry 原始 SHA；控件/插件浏览器用例覆盖部分 API |
| `src/components/reui/dropdown-menu.tsx` | 编辑器共享组件 | 既有语义节点 / 共享组件组合 | DropdownMenuPrimitive.Root, DropdownMenuPrimitive.Portal, DropdownMenuPrimitive.Trigger, DropdownMenuPrimitive.SubTrigger, DropdownMenuPrimitive.SubContent, DropdownMenuPrimitive.Content, DropdownMenuPrimitive.Group, DropdownMenuPrimitive.Item, DropdownMenuPrimitive.CheckboxItem, DropdownMenuPrimitive.ItemIndicator, DropdownMenuPrimitive.RadioItem, DropdownMenuPrimitive.Label, DropdownMenuPrimitive.RadioGroup, DropdownMenuPrimitive.Separator, DropdownMenuPrimitive.Sub | 已审计，未改动；官方 ReUI vendored | 固定 registry 原始 SHA；控件/插件浏览器用例覆盖部分 API |
| `src/components/reui/index.ts` | 编辑器共享组件 | 新增 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 新增 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/reui/input.tsx` | 官方输入原语适配 | 官方 ReUI v1 Input + React18 forwardRef | 增加 Slot asChild，使 Frimousse Search 的实际 DOM 使用 ReUI 输入；保留官方 variants | 已改（含格式化/直接引用整理）；官方 ReUI vendored | tests/browser/plugin-ui.spec.ts：真实emoji搜索；controls |
| `src/components/reui/label.tsx` | 编辑器共享组件 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动；官方 ReUI vendored | 固定 registry 原始 SHA；控件/插件浏览器用例覆盖部分 API |
| `src/components/reui/popover.tsx` | 编辑器共享组件 | 既有语义节点 / 共享组件组合 | PopoverPrimitive.Root, PopoverPrimitive.Trigger, PopoverPrimitive.PopoverPortal, PopoverPrimitive.Content, PopoverPrimitive.Anchor | 已审计，未改动；官方 ReUI vendored | 固定 registry 原始 SHA；控件/插件浏览器用例覆盖部分 API |
| `src/components/reui/select.tsx` | 编辑器共享组件 | 既有语义节点 / 共享组件组合 | SelectContext.Provider, SelectPrimitive.Root, SelectPrimitive.Group, SelectPrimitive.Value, SelectPrimitive.Trigger, SelectPrimitive.Icon, SelectPrimitive.ScrollUpButton, SelectPrimitive.ScrollDownButton, SelectPrimitive.Portal, SelectPrimitive.Content, SelectScrollUpButton, SelectPrimitive.Viewport, SelectScrollDownButton, SelectPrimitive.Label, SelectPrimitive.Item, SelectPrimitive.ItemIndicator, SelectPrimitive.ItemText, SelectPrimitive.Separator | 已审计，未改动；官方 ReUI vendored | 固定 registry 原始 SHA；控件/插件浏览器用例覆盖部分 API |
| `src/components/reui/separator.tsx` | 编辑器共享组件 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动；官方 ReUI vendored | 固定 registry 原始 SHA；控件/插件浏览器用例覆盖部分 API |
| `src/components/reui/slider.tsx` | 编辑器共享组件 | 新增 | SliderPrimitive.Root, SliderPrimitive.Track, SliderPrimitive.Range, SliderPrimitive.Thumb | 新增；官方 ReUI vendored | 固定 registry 原始 SHA；控件/插件浏览器用例覆盖部分 API |
| `src/components/reui/sonner.tsx` | 编辑器共享组件 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动；官方 ReUI vendored | 固定 registry 原始 SHA；控件/插件浏览器用例覆盖部分 API |
| `src/components/reui/switch.tsx` | 编辑器共享组件 | 既有语义节点 / 共享组件组合 | SwitchContext.Provider, SwitchPrimitive.Root, SwitchPrimitive.Thumb | 已审计，未改动；官方 ReUI vendored | 固定 registry 原始 SHA；控件/插件浏览器用例覆盖部分 API |
| `src/components/reui/tabs.tsx` | 编辑器共享组件 | 既有语义节点 / 共享组件组合 | TabsPrimitive.Root, TabsContext.Provider, TabsPrimitive.List, TabsPrimitive.Trigger, TabsPrimitive.Content | 已审计，未改动；官方 ReUI vendored | 固定 registry 原始 SHA；控件/插件浏览器用例覆盖部分 API |
| `src/components/reui/textarea.tsx` | 编辑器共享组件 | native-control×1 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动；官方 ReUI vendored | 固定 registry 原始 SHA；控件/插件浏览器用例覆盖部分 API |
| `src/components/reui/toggle.tsx` | 编辑器共享组件 | 既有语义节点 / 共享组件组合 | TogglePrimitive.Root | 已审计，未改动；官方 ReUI vendored | 固定 registry 原始 SHA；控件/插件浏览器用例覆盖部分 API |
| `src/components/reui/tooltip.tsx` | 编辑器共享组件 | 既有语义节点 / 共享组件组合 | TooltipPrimitive.Provider, TooltipProvider, TooltipPrimitive.Root, TooltipPrimitive.Trigger, TooltipPrimitive.Portal, TooltipPrimitive.Content, TooltipPrimitive.Arrow | 已审计，未改动；官方 ReUI vendored | 固定 registry 原始 SHA；控件/插件浏览器用例覆盖部分 API |
| `src/components/RichTextProvider.tsx` | 本库公开编辑器主体/上下文/Portal | 旧 UI 目录的 tooltip/通知路径；Context/ProseMirror 原生 | 直接 ReUI TooltipProvider + Sonner；保留 scoped reset、theme、event bus、EditorContext | 已改（含格式化/直接引用整理） | tests/browser/playground.spec.ts / controls.spec.ts；existing 两编辑器隔离；SAP整套回归 |
| `src/components/SizeSetter/SizeSetter.tsx` | 编辑器共享组件 | legacy-ui-import×1 | Popover, PopoverTrigger, PopoverContent, Input, Button | 已改（含格式化/直接引用整理） | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/SlashDialogTrigger/RenderDialogUploadImage.tsx` | 编辑器共享组件 | legacy-ui-import×1; native-control×1 | Dialog, DialogContent, DialogTitle, Tabs, TabsList, TabsTrigger, Checkbox, Input, TabsContent, Button | 已改（含格式化/直接引用整理）；1 个精确原生例外 | 精确源节点与理由：native-exceptions.json；交互覆盖仅限 VALIDATION_COMPLETION.md 列项 |
| `src/components/SlashDialogTrigger/RenderDialogUploadVideo.tsx` | 编辑器共享组件 | legacy-ui-import×1 | Dialog, DialogContent, DialogTitle, Tabs, TabsList, TabsTrigger, TabsContent, Input, Button | 已改（含格式化/直接引用整理） | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/SlashDialogTrigger/SlashDialogTrigger.tsx` | 编辑器共享组件 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/components/ui/button.tsx` | 编辑器共享组件 | 既有语义节点 / 共享组件组合 | 已删除；不是保留旧源码的重命名目录 | 删除 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/ui/checkbox.tsx` | 编辑器共享组件 | 非交互代码 | 已删除；不是保留旧源码的重命名目录 | 删除 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/ui/dialog.tsx` | 编辑器共享组件 | 非交互代码 | 已删除；不是保留旧源码的重命名目录 | 删除 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/ui/dropdown-menu.tsx` | 编辑器共享组件 | 非交互代码 | 已删除；不是保留旧源码的重命名目录 | 删除 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/ui/emoji-picker.tsx` | 编辑器共享组件 | native-control×1 | 已删除；不是保留旧源码的重命名目录 | 删除 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/ui/index.ts` | 编辑器共享组件 | 非交互代码 | 已删除；不是保留旧源码的重命名目录 | 删除 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/ui/input.tsx` | 编辑器共享组件 | 非交互代码 | 已删除；不是保留旧源码的重命名目录 | 删除 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/ui/label.tsx` | 编辑器共享组件 | 非交互代码 | 已删除；不是保留旧源码的重命名目录 | 删除 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/ui/popover.tsx` | 编辑器共享组件 | 非交互代码 | 已删除；不是保留旧源码的重命名目录 | 删除 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/ui/select.tsx` | 编辑器共享组件 | 非交互代码 | 已删除；不是保留旧源码的重命名目录 | 删除 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/ui/separator.tsx` | 编辑器共享组件 | 非交互代码 | 已删除；不是保留旧源码的重命名目录 | 删除 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/ui/switch.tsx` | 编辑器共享组件 | 非交互代码 | 已删除；不是保留旧源码的重命名目录 | 删除 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/ui/tabs.tsx` | 编辑器共享组件 | 非交互代码 | 已删除；不是保留旧源码的重命名目录 | 删除 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/ui/textarea.tsx` | 编辑器共享组件 | 非交互代码 | 已删除；不是保留旧源码的重命名目录 | 删除 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/ui/toast.tsx` | 编辑器共享组件 | 非交互代码 | 已删除；不是保留旧源码的重命名目录 | 删除 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/ui/toggle.tsx` | 编辑器共享组件 | 非交互代码 | 已删除；不是保留旧源码的重命名目录 | 删除 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/ui/tooltip.tsx` | 编辑器共享组件 | 非交互代码 | 已删除；不是保留旧源码的重命名目录 | 删除 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/components/ui/use-toast.ts` | 编辑器共享组件 | 非交互代码 | 已删除；不是保留旧源码的重命名目录 | 删除 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/constants/index.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/constants/resetCSS.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已改（含格式化/直接引用整理） | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/AI/AI.ts` | AI 插件 | 非交互代码 | 必要的文档/导出/媒体 DOM；见原生及外部引擎边界 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/AI/AIPanel.tsx` | AI 预览与应用（无真实服务接入） | 原生 button×9、textarea、select和独立控件皮肤 | 官方 ReUI Card/Button/Textarea/Select 组合；保留异步、取消、IME和安全文本应用 | 已改（含格式化/直接引用整理） | existing AI mock预览/停止/应用/丢弃/长文本安全；未调用付费AI |
| `src/extensions/AI/client.ts` | AI 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/AI/index.ts` | AI 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/AI/state.ts` | AI 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/AI/types.ts` | AI 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Attachment/Attachment.ts` | Attachment 插件 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Attachment/components/NodeViewAttachment/FileIcon.tsx` | Attachment 插件 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Attachment/components/NodeViewAttachment/FileIconString.ts` | Attachment 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Attachment/components/NodeViewAttachment/NodeViewAttachment.tsx` | 附件上传/重试/删除 | p点击上传、被动div空点击、旧Dialog路径 | 真实ReUI Button/Popover/Dialog；隐藏file input仅浏览器桥，移除被动空点击 | 已改（含格式化/直接引用整理）；1 个精确原生例外 | tests/browser/plugin-ui.spec.ts：潜藏fixture真实chooser/upload/delete；上传HTTP为本地模拟 |
| `src/extensions/Attachment/components/RichTextAttachment.tsx` | Attachment 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Attachment/index.ts` | Attachment 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Blockquote/Blockquote.ts` | Blockquote 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Blockquote/components/RichTextBlockquote.tsx` | Blockquote 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Blockquote/index.ts` | Blockquote 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Bold/Bold.ts` | Bold 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Bold/components/RichTextBold.tsx` | Bold 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Bold/index.ts` | Bold 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/BulletList/BulletList.ts` | BulletList 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/BulletList/components/RichTextBulletList.tsx` | BulletList 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/BulletList/index.ts` | BulletList 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Callout/Callout.ts` | Callout 插件 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Callout/components/NodeViewCallout/NodeViewCallout.tsx` | 提示节点编辑壳 | 自定义提示框外观 | 官方 ReUI Alert/Icon/Content/Title/Description + scoped severity token；保留原有 atom 属性节点，通过编辑 Bubble 改内容，不改 schema/API | 已改（含格式化/直接引用整理） | plugin-ui：真实插入/编辑警告节点；使用原有属性编辑Dialog，不假称内联正文编辑 |
| `src/extensions/Callout/components/RichTextCallout.tsx` | 提示节点表单 | 旧 UI adapter 引用，Label未关联控件 | 直接官方 ReUI Dialog/Select/Input/Textarea/Button；useId关联Label | 已改（含格式化/直接引用整理） | tests/browser/plugin-ui.spec.ts：类型选择/标题/正文/插入 |
| `src/extensions/Callout/index.ts` | Callout 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Clear/Clear.ts` | Clear 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Clear/components/RichTextClear.tsx` | Clear 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Clear/index.ts` | Clear 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Code/Code.ts` | Code 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Code/components/RichTextCode.tsx` | Code 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Code/index.ts` | Code 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/CodeBlock/CodeBlock.ts` | CodeBlock 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/CodeBlock/components/RichTextCodeBlock.tsx` | CodeBlock 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/CodeBlock/extension-code-block-rangi/src/code-block-rangi.ts` | CodeBlock 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/CodeBlock/extension-code-block-rangi/src/index.ts` | CodeBlock 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/CodeBlock/extension-code-block-rangi/src/rangi-plugin.ts` | CodeBlock 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/CodeBlock/index.ts` | CodeBlock 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/CodeView/CodeView.ts` | CodeView 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/CodeView/components/RichTextCodeView.tsx` | CodeView 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/CodeView/index.ts` | CodeView 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Color/Color.ts` | Color 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Color/components/RichTextColor.tsx` | Color 插件 | 既有语义节点 / 共享组件组合 | ColorPicker, ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Color/index.ts` | Color 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Column/Column.ts` | Column 插件 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Column/components/RichTextColumn.tsx` | Column 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Column/index.ts` | Column 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Details/components/RichTextDetails.tsx` | Details 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Details/Details.ts` | Details 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Details/index.ts` | Details 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Drawer/components/ControlDrawer/ControlDrawer.tsx` | 绘图工具、颜色、线宽/填充 | 原生工具/色块按钮、2个 range、自制浮层 | ReUI Card/Button/Slider/Separator；easydrawer 只保留 canvas 引擎，工具条重新组合 | 已改（含格式化/直接引用整理） | tests/browser/plugin-ui.spec.ts：真实画线/矩形、颜色、键盘Slider、撤销重做/保存；existing Drawer |
| `src/extensions/Drawer/components/ControlDrawer/icon.tsx` | Drawer 插件 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Drawer/components/DrawerCanvas.tsx` | Drawer 插件 | legacy-ui-import×2 | DialogFooter, Button | 已改（含格式化/直接引用整理） | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Drawer/components/EditDrawerBlock.tsx` | Drawer 插件 | legacy-ui-import×1 | Dialog, DialogTrigger, ActionButton, DialogContent, DialogTitle | 已改（含格式化/直接引用整理） | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Drawer/components/NodeViewDrawer/NodeViewDrawer.tsx` | Drawer 插件 | native-interaction×2 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动；2 个精确原生例外 | 精确源节点与理由：native-exceptions.json；交互覆盖仅限 VALIDATION_COMPLETION.md 列项 |
| `src/extensions/Drawer/components/RichTextDrawer.tsx` | Drawer 插件 | legacy-ui-import×1 | Dialog, DialogTrigger, ActionButton, DialogContent, DialogTitle | 已改（含格式化/直接引用整理） | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Drawer/Drawer.ts` | Drawer 插件 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Drawer/index.ts` | Drawer 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Drawer/types.ts` | Drawer 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Emoji/components/EmojiList/EmojiNodeView.tsx` | Emoji短码建议 | 原生按钮或 span+onClick，独立高亮皮肤 | 官方 ReUI Card 表面 + ReUI Button选项，保留键盘/鼠标/active scroll与选择，不保留假按钮包装 | 已改（含格式化/直接引用整理） | tests/browser/plugin-ui.spec.ts；斜杠另见 tests/browser/sap-blocks.spec.ts |
| `src/extensions/Emoji/components/EmojiPickerPanel.tsx` | Emoji 插件 | legacy-ui-import×1 | EmojiPicker, EmojiPickerSearch, EmojiPickerContent, EmojiPickerFooter | 已改（含格式化/直接引用整理） | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Emoji/components/RichTextEmoji.tsx` | Emoji 插件 | 既有语义节点 / 共享组件组合 | Popover, PopoverTrigger, PopoverContent, EmojiPickerWrap, ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Emoji/Emoji.ts` | Emoji 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Emoji/index.ts` | Emoji 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Excalidraw/components/NodeViewExcalidraw/NodeViewExcalidraw.tsx` | Excalidraw 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Excalidraw/components/RichTextExcalidraw.tsx` | Excalidraw 插件 | legacy-ui-import×2 | Dialog, DialogTrigger, ActionButton, DialogContent, DialogTitle, DialogFooter, Button | 已改（含格式化/直接引用整理） | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Excalidraw/Excalidraw.ts` | Excalidraw 插件 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Excalidraw/index.ts` | Excalidraw 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/ExportMarkdown/components/RichTextExportMarkdown.tsx` | ExportMarkdown 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/ExportMarkdown/createMarkdown.ts` | ExportMarkdown 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/ExportMarkdown/ExportMarkdown.ts` | ExportMarkdown 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/ExportMarkdown/index.ts` | ExportMarkdown 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/ExportPdf/components/RichTextExportPdf.tsx` | ExportPdf 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/ExportPdf/ExportPdf.ts` | ExportPdf 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/ExportPdf/index.ts` | ExportPdf 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/ExportWord/components/RichTextExportWord.tsx` | ExportWord 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/ExportWord/createWordBlob.ts` | ExportWord 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/ExportWord/ExportWord.ts` | ExportWord 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/ExportWord/index.ts` | ExportWord 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/FontFamily/components/RichTextFontFamily.tsx` | FontFamily 插件 | 既有语义节点 / 共享组件组合 | DropdownMenu, DropdownMenuTrigger, ActionMenuButton, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuSeparator | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/FontFamily/FontFamily.ts` | FontFamily 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/FontFamily/index.ts` | FontFamily 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/FontSize/components/RichTextFontSize.tsx` | FontSize 插件 | 既有语义节点 / 共享组件组合 | DropdownMenu, DropdownMenuTrigger, ActionMenuButton, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuSeparator | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/FontSize/FontSize.ts` | FontSize 插件 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/FontSize/index.ts` | FontSize 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/FormatPainter/components/RichTextFormatPainter.tsx` | FormatPainter 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/FormatPainter/FormatPainter.ts` | FormatPainter 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/FormatPainter/index.ts` | FormatPainter 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Heading/components/RichTextHeading.tsx` | Heading 插件 | 既有语义节点 / 共享组件组合 | DropdownMenu, DropdownMenuTrigger, ActionMenuButton, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuShortcut, DropdownMenuSeparator | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Heading/Heading.ts` | Heading 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Heading/index.ts` | Heading 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Highlight/components/RichTextHighlight.tsx` | Highlight 插件 | 既有语义节点 / 共享组件组合 | ColorPicker, ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Highlight/Highlight.ts` | Highlight 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Highlight/index.ts` | Highlight 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/History/components/RichTextHistory.tsx` | History 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/History/History.ts` | History 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/History/index.ts` | History 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/HorizontalRule/components/RichTextHorizontalRule.tsx` | HorizontalRule 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/HorizontalRule/HorizontalRule.ts` | HorizontalRule 插件 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/HorizontalRule/index.ts` | HorizontalRule 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Iframe/components/IframeNodeView.tsx` | Iframe 插件 | legacy-ui-import×1 | Input, Button | 已改（含格式化/直接引用整理） | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Iframe/components/RichTextIframe.tsx` | Iframe 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Iframe/Iframe.ts` | Iframe 插件 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Iframe/index.ts` | Iframe 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Iframe/utils.ts` | Iframe 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Image/components/ImageCropper.tsx` | Image 插件 | legacy-ui-import×2; native-control×1 | Button, Dialog, DialogTrigger, DialogContent, DialogTitle, DialogFooter | 已改（含格式化/直接引用整理）；1 个精确原生例外 | 精确源节点与理由：native-exceptions.json；交互覆盖仅限 VALIDATION_COMPLETION.md 列项 |
| `src/extensions/Image/components/ImageView.tsx` | Image 插件 | native-interaction×2 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动；2 个精确原生例外 | 精确源节点与理由：native-exceptions.json；交互覆盖仅限 VALIDATION_COMPLETION.md 列项 |
| `src/extensions/Image/components/RichTextImage.tsx` | Image 插件 | legacy-ui-import×1; native-control×1 | Dialog, DialogTrigger, ActionButton, DialogContent, DialogTitle, Tabs, TabsList, TabsTrigger, Checkbox, Input, TabsContent, Button | 已改（含格式化/直接引用整理）；1 个精确原生例外 | 精确源节点与理由：native-exceptions.json；交互覆盖仅限 VALIDATION_COMPLETION.md 列项 |
| `src/extensions/Image/Image.ts` | Image 插件 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Image/index.ts` | Image 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/ImageGif/components/ImageGifView.tsx` | ImageGif 插件 | native-interaction×2 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动；2 个精确原生例外 | 精确源节点与理由：native-exceptions.json；交互覆盖仅限 VALIDATION_COMPLETION.md 列项 |
| `src/extensions/ImageGif/components/RichTextImageGif.tsx` | GIF搜索与缩略图选择 | img直接onClick | 每个候选由真实ReUI Button承载，Input搜索，保留图片数据引擎 | 已改（含格式化/直接引用整理） | tests/browser/plugin-ui.spec.ts：真实搜索/插入；只mock外部GIF HTTP，非生产API可用性证明 |
| `src/extensions/ImageGif/components/services.ts` | ImageGif 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/ImageGif/ImageGif.ts` | ImageGif 插件 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/ImageGif/index.ts` | ImageGif 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/ImportWord/components/RichTextImportWord.tsx` | ImportWord 插件 | native-control×1 | ActionButton | 已审计，未改动；1 个精确原生例外 | 精确源节点与理由：native-exceptions.json；交互覆盖仅限 VALIDATION_COMPLETION.md 列项 |
| `src/extensions/ImportWord/ImportWord.ts` | ImportWord 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/ImportWord/index.ts` | ImportWord 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Indent/components/RichTextIndent.tsx` | Indent 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Indent/Indent.ts` | Indent 插件 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Indent/index.ts` | Indent 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Italic/components/RichTextItalic.tsx` | Italic 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Italic/index.ts` | Italic 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Italic/Italic.ts` | Italic 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Katex/components/KatexPreview.tsx` | 延迟加载/失败重试 | 原生button重试 | ReUI Button，保留错误边界和重试状态 | 已改（含格式化/直接引用整理） | 静态/类型/构建；成功lazy路径测试；未逐一网络故障注入 |
| `src/extensions/Katex/components/KatexWrapper.tsx` | Katex 插件 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Katex/components/RichTextKatex.tsx` | Katex 插件 | legacy-ui-import×2 | Dialog, DialogTrigger, ActionButton, DialogContent, DialogTitle, Textarea, DialogFooter, Button | 已改（含格式化/直接引用整理） | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Katex/index.ts` | Katex 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Katex/katex-loader.ts` | Katex 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Katex/Katex.ts` | Katex 插件 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/LineHeight/components/RichTextLightHeight.tsx` | LineHeight 插件 | 既有语义节点 / 共享组件组合 | DropdownMenu, DropdownMenuTrigger, ActionButton, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuSeparator | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/LineHeight/index.ts` | LineHeight 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/LineHeight/LineHeight.ts` | LineHeight 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Link/components/LinkEditBlock.tsx` | Link 插件 | 既有语义节点 / 共享组件组合 | Input, Checkbox, Button | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Link/components/LinkViewBlock.tsx` | Link 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Link/components/RichTextLink.tsx` | Link 插件 | 既有语义节点 / 共享组件组合 | Popover, PopoverTrigger, ActionButton, PopoverContent | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Link/index.ts` | Link 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Link/Link.ts` | Link 插件 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/MarkdownPaste/index.ts` | MarkdownPaste 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/MarkdownPaste/MarkdownPaste.ts` | MarkdownPaste 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Mention/components/NodeViewMentionList.tsx` | 提及建议 | 原生按钮或 span+onClick，独立高亮皮肤 | 官方 ReUI Card 表面 + ReUI Button选项，保留键盘/鼠标/active scroll与选择，不保留假按钮包装 | 已改（含格式化/直接引用整理） | tests/browser/plugin-ui.spec.ts；斜杠另见 tests/browser/sap-blocks.spec.ts |
| `src/extensions/Mention/index.ts` | Mention 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Mention/Mention.ts` | Mention 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Mermaid/components/EditMermaidBlock.tsx` | Mermaid 插件 | legacy-ui-import×3 | Dialog, DialogTrigger, ActionButton, DialogContent, DialogTitle, Textarea, DialogFooter, Button | 已改（含格式化/直接引用整理） | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Mermaid/components/NodeViewMermaid/NodeViewMermaid.tsx` | Mermaid 插件 | native-interaction×2 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动；2 个精确原生例外 | 精确源节点与理由：native-exceptions.json；交互覆盖仅限 VALIDATION_COMPLETION.md 列项 |
| `src/extensions/Mermaid/components/RichTextMermaid.tsx` | Mermaid 插件 | legacy-ui-import×3 | Dialog, DialogTrigger, ActionButton, DialogContent, DialogTitle, Textarea, DialogFooter, Button | 已改（含格式化/直接引用整理） | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Mermaid/index.ts` | Mermaid 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Mermaid/Mermaid.ts` | Mermaid 插件 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/MoreMark/components/RichTextMoreMark.tsx` | MoreMark 插件 | 既有语义节点 / 共享组件组合 | DropdownMenu, DropdownMenuTrigger, ActionButton, DropdownMenuContent, DropdownMenuCheckboxItem | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/MoreMark/index.ts` | MoreMark 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/MoreMark/MoreMark.ts` | MoreMark 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/OrderedList/components/RichTextOrderedList.tsx` | OrderedList 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/OrderedList/index.ts` | OrderedList 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/OrderedList/OrderedList.ts` | OrderedList 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/SearchAndReplace/components/RichTextSearchAndReplace.tsx` | SearchAndReplace 插件 | 既有语义节点 / 共享组件组合 | Popover, PopoverTrigger, ActionButton, PopoverContent, Input, Button, Checkbox | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/SearchAndReplace/index.ts` | SearchAndReplace 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/SearchAndReplace/SearchAndReplace.ts` | SearchAndReplace 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/ShortMessage/components/ShortMessageList.tsx` | 短语建议 | 原生按钮或 span+onClick，独立高亮皮肤 | 官方 ReUI Card 表面 + ReUI Button选项，保留键盘/鼠标/active scroll与选择，不保留假按钮包装 | 已改（含格式化/直接引用整理） | tests/browser/plugin-ui.spec.ts；斜杠另见 tests/browser/sap-blocks.spec.ts |
| `src/extensions/ShortMessage/index.ts` | ShortMessage 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/ShortMessage/ShortMessage.ts` | ShortMessage 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/ShortMessage/types.ts` | ShortMessage 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/SlashCommand/components/SlashCommandList.tsx` | SlashCommand 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/SlashCommand/components/SlashCommandNodeView.tsx` | 斜杠菜单 | 原生按钮或 span+onClick，独立高亮皮肤 | 官方 ReUI Card 表面 + ReUI Button选项，保留键盘/鼠标/active scroll与选择，不保留假按钮包装 | 已改（含格式化/直接引用整理） | tests/browser/plugin-ui.spec.ts；斜杠另见 tests/browser/sap-blocks.spec.ts |
| `src/extensions/SlashCommand/index.ts` | SlashCommand 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/SlashCommand/renderCommandListDefault.ts` | SlashCommand 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/SlashCommand/SlashCommand.ts` | SlashCommand 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/SlashCommand/types.ts` | SlashCommand 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Strike/components/RichTextStrike.tsx` | Strike 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Strike/index.ts` | Strike 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Strike/Strike.ts` | Strike 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Table/components/CreateTablePopover.tsx` | 表格尺寸/表头 | 网格 div 子格、自定义指针处理 | ReUI Button单元格 + Checkbox表头；保留外层原生pointer capture用于拖选 | 已改（含格式化/直接引用整理）；1 个精确原生例外 | tests/browser/plugin-ui.spec.ts：键盘选尺寸/表头；SAP表格操作；原有pointer算法保留 |
| `src/extensions/Table/components/RichTextTable.tsx` | 表格命令入口 | 旧路径并把表头选项错误覆写为false | 直接ReUI组合；修复insertTable遵从Checkbox结果 | 已改（含格式化/直接引用整理） | tests/browser/plugin-ui.spec.ts：真实TH和表格行列 |
| `src/extensions/Table/index.ts` | Table 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Table/Table.ts` | Table 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Table/TableCellBackground.ts` | Table 插件 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/TableOfContents/components/NodeViewTableOfContents.tsx` | 库内文档目录 | 原生button导航 | ReUI Button，语义目录容器保留 | 已改（含格式化/直接引用整理） | tests/browser/plugin-ui.spec.ts：未在默认Playground启用的fixture目录跳转 |
| `src/extensions/TableOfContents/components/RichTextTableOfContents.tsx` | TableOfContents 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/TableOfContents/components/useTableOfContents.ts` | TableOfContents 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/TableOfContents/index.ts` | TableOfContents 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/TableOfContents/TableOfContents.ts` | TableOfContents 插件 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/TaskList/components/RichTextTaskList.tsx` | TaskList 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/TaskList/index.ts` | TaskList 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/TaskList/TaskList.ts` | TaskList 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/TextAlign/components/RichTextAlign.tsx` | TextAlign 插件 | legacy-ui-import×1 | Popover, PopoverTrigger, ActionButton, PopoverContent, Tooltip, TooltipTrigger, Toggle, TooltipContent | 已改（含格式化/直接引用整理） | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/TextAlign/index.ts` | TextAlign 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/TextAlign/TextAlign.ts` | TextAlign 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/TextDirection/components/RichTextTextDirection.tsx` | TextDirection 插件 | legacy-ui-import×1 | Popover, PopoverTrigger, ActionButton, PopoverContent, Tooltip, TooltipTrigger, Toggle, TooltipContent | 已改（含格式化/直接引用整理） | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/TextDirection/index.ts` | TextDirection 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/TextDirection/TextDirection.ts` | TextDirection 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/TextUnderline/components/RichTextUnderline.tsx` | TextUnderline 插件 | 既有语义节点 / 共享组件组合 | ActionButton | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/TextUnderline/index.ts` | TextUnderline 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/TextUnderline/TextUnderline.ts` | TextUnderline 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Twitter/components/FormEditLinkTwitter.tsx` | Twitter 插件 | 既有语义节点 / 共享组件组合 | Input, Button | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Twitter/components/NodeViewTweet.tsx` | Twitter 插件 | 既有语义节点 / 共享组件组合 | 语义布局、图标或文档节点；交互控件通过共享 ReUI 组件组合 | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Twitter/components/RichTextTwitter.tsx` | Twitter 插件 | 既有语义节点 / 共享组件组合 | Popover, PopoverTrigger, ActionButton, PopoverContent | 已审计，未改动 | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Twitter/index.ts` | Twitter 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Twitter/Twitter.ts` | Twitter 插件 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Video/components/RichTextVideo.tsx` | Video 插件 | legacy-ui-import×1 | Dialog, DialogTrigger, ActionButton, DialogContent, DialogTitle, Tabs, TabsList, TabsTrigger, TabsContent, Input, Button | 已改（含格式化/直接引用整理） | 静态逐文件核对＋类型/构建；不声称此文件每条分支均浏览器覆盖 |
| `src/extensions/Video/components/VideoUploadTab.tsx` | Video 插件 | native-control×1 | Button | 已审计，未改动；1 个精确原生例外 | 精确源节点与理由：native-exceptions.json；交互覆盖仅限 VALIDATION_COMPLETION.md 列项 |
| `src/extensions/Video/index.ts` | Video 插件 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/extensions/Video/Video.ts` | Video 插件 | 非交互代码 | 文档 schema / command / contentDOM（非表单控件）；UI 由同插件 components 和共享 ReUI 控件提供 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/hooks/useActive.tsx` | 共享 hooks | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/hooks/useAttributes.tsx` | 共享 hooks | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/hooks/useButtonProps.ts` | 共享 hooks | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/hooks/useExtension.tsx` | 共享 hooks | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/hooks/useLocalStorage.ts` | 共享 hooks | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/index.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/lib/utils.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/locale-bundle.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/locale.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/locales/en.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已改（含格式化/直接引用整理） | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/locales/fi.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/locales/hu.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/locales/index.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/locales/ja.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/locales/pt-br.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/locales/vi.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/locales/zh-cn.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已改（含格式化/直接引用整理） | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/store/commandList.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/store/editor.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/store/EditorEditableReactive.tsx` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/store/store.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/store/ThemeColorReactive.tsx` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/svg64.d.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/theme/theme.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/types.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/base64.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/checkIsVideoUrl.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/columns.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/customEvents/events.constant.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/delete-node.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/dom-dataset.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/download.ts` | 编辑器模块 | 非交互代码 | 必要的文档/导出/媒体 DOM；见原生及外部引擎边界 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/dynamicCSS.ts` | 编辑器模块 | 非交互代码 | 必要的文档/导出/媒体 DOM；见原生及外部引擎边界 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/editor-container-size.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/file.ts` | 编辑器模块 | 非交互代码 | 必要的文档/导出/媒体 DOM；见原生及外部引擎边界 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/indent.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/is-mobile.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/json.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/mitt.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/pdf.ts` | 编辑器模块 | 非交互代码 | 必要的文档/导出/媒体 DOM；见原生及外部引擎边界 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/plateform.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/renderNodeView.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/shortId.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/updatePosition.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/utils.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/utils/validateFile.ts` | 编辑器模块 | legacy-ui-import×1 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已改（含格式化/直接引用整理） | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |
| `src/vite-env.d.ts` | 编辑器模块 | 非交互代码 | 非交互模块（API、schema、数据、状态或工具）；无独立 UI 待替换 | 已审计，未改动 | 全源 AST / 类型 / 导出门禁；非逐功能运行证明 |

## 样式、HTML 与构建/发布入口（单独全量盘点）

这些不是 JSX 控件，单独记录避免被源码数量掩盖。原始/当前文件 SHA 在 style-baseline.json / style-current.json；不把静态 hash 说成运行覆盖。

| 路径 | 作用 | 变化 | 核验 |
| --- | --- | --- | --- |
| `.github/workflows/ci.yml` | CI / deploy (no npm publishing) | 已改 | Static review + builds; no claim of exhaustive visual/property testing |
| `.github/workflows/pages.yml` | CI / deploy (no npm publishing) | 已改 | Static review + builds; no claim of exhaustive visual/property testing |
| `components.json` | build/config/package boundary | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/.vitepress/components/Changelog.vue` | retained upstream Vue/VitePress documentation host (not Pages artifact) | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/.vitepress/components/Contributors.vue` | retained upstream Vue/VitePress documentation host (not Pages artifact) | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/.vitepress/components/HomeContributors.vue` | retained upstream Vue/VitePress documentation host (not Pages artifact) | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/.vitepress/components/HomePage.vue` | retained upstream Vue/VitePress documentation host (not Pages artifact) | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/.vitepress/config.ts` | retained upstream Vue/VitePress documentation host (not Pages artifact) | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/.vitepress/i18n/composable.ts` | retained upstream Vue/VitePress documentation host (not Pages artifact) | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/.vitepress/i18n/locales.ts` | retained upstream Vue/VitePress documentation host (not Pages artifact) | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/.vitepress/i18n/utils.ts` | retained upstream Vue/VitePress documentation host (not Pages artifact) | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/.vitepress/locale.ts` | retained upstream Vue/VitePress documentation host (not Pages artifact) | 已改 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/.vitepress/plugins/changelog.ts` | retained upstream Vue/VitePress documentation host (not Pages artifact) | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/.vitepress/plugins/contributors.ts` | retained upstream Vue/VitePress documentation host (not Pages artifact) | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/.vitepress/plugins/markdownTransform.ts` | retained upstream Vue/VitePress documentation host (not Pages artifact) | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/.vitepress/theme/Layout.vue` | retained upstream Vue/VitePress documentation host (not Pages artifact) | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/.vitepress/theme/index.ts` | retained upstream Vue/VitePress documentation host (not Pages artifact) | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/.vitepress/theme/style.css` | retained upstream Vue/VitePress documentation host (not Pages artifact) | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/.vitepress/theme/utils.ts` | retained upstream Vue/VitePress documentation host (not Pages artifact) | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/.vitepress/transformHead.ts` | retained upstream Vue/VitePress documentation host (not Pages artifact) | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/uno.config.ts` | build/config/package boundary | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `docs/vite.config.ts` | build/config/package boundary | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `index.html` | static build entry | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `package.json` | build/config/package boundary | 已改 | Static review + builds; no claim of exhaustive visual/property testing |
| `playground/index.html` | static build entry | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `playground/package.json` | build/config/package boundary | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `playground/postcss.config.js` | build/config/package boundary | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `playground/sap/index.html` | static build entry | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `playground/src/global.css` | scoped styles/theme/document layout | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `playground/src/sap/sap.css` | scoped styles/theme/document layout | 已改 | SAP narrow/zoom/print screenshots and browser assertions |
| `playground/tailwind.config.js` | build/config/package boundary | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `playground/tsconfig.json` | build/config/package boundary | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `playground/vite.config.ts` | build/config/package boundary | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `playwright.config.ts` | build/config/package boundary | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `postcss.config.js` | build/config/package boundary | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `src/extensions/Attachment/components/NodeViewAttachment/index.module.scss` | scoped styles/theme/document layout | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `src/extensions/Drawer/components/ControlDrawer/ControlDrawer.module.scss` | scoped styles/theme/document layout | 已改 | Drawing toolbar pixel/slider tests and screenshot |
| `src/extensions/Excalidraw/components/NodeViewExcalidraw/index.module.scss` | scoped styles/theme/document layout | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `src/extensions/Iframe/components/index.module.scss` | scoped styles/theme/document layout | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `src/styles/ProseMirror.scss` | scoped styles/theme/document layout | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `src/styles/ai.scss` | scoped styles/theme/document layout | 已改 | AI preview/apply/discard/cancel browser fixture |
| `src/styles/codeblock.scss` | scoped styles/theme/document layout | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `src/styles/columns.scss` | scoped styles/theme/document layout | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `src/styles/details.scss` | scoped styles/theme/document layout | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `src/styles/editor.scss` | scoped styles/theme/document layout | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `src/styles/global.scss` | scoped styles/theme/document layout | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `src/styles/index.scss` | scoped styles/theme/document layout | 已改 | Static review + builds; no claim of exhaustive visual/property testing |
| `src/styles/mention.scss` | scoped styles/theme/document layout | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `src/styles/toc.scss` | scoped styles/theme/document layout | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `tailwind.config.js` | build/config/package boundary | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `tests/vite.config.ts` | build/config/package boundary | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `tsconfig.json` | build/config/package boundary | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
| `vite.config.ts` | build/config/package boundary | 已审阅，未改动 | Static review + builds; no claim of exhaustive visual/property testing |
