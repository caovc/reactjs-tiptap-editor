# ReUI 迁移：全仓补全与来源

## 对第一轮结论的更正

第一轮只完成了15类基础控件，**不能据此宣称编辑器主体和全部插件 UI 都完成迁移**。遗留项包括业务层直接 Radix、原生工具/建议按钮、颜色选择器、绘图工具、AI 表单、浮层表面和隐藏插件。这次重新遍历全部源码，移除 `src/components/ui/` 的18个旧文件，业务直接组合官方 ReUI，而不是继续保留旧实现套壳。

- [逐文件旧/新映射、作用与证据等级](FULL_AUDIT.md)：包括没有出现在默认 Playground 的模块。
- [完整 AST 基线](full-audit/baseline.json) / [当前 AST、事件、DOM sink、文件 SHA](full-audit/current.json)。
- [真实验证与未覆盖项](VALIDATION_COMPLETION.md)；`VALIDATION.md` 是第一轮历史记录。
- [逐节点原生例外与理由](../../scripts/reui/native-exceptions.json)。

## 官方来源，而不是重命名 shadcn

使用官方 **ReUI v1** 固定提交 `a98dda1432a74c2e3d6680887325f859eaa32cdf`。当前 ReUI registry 对基础控件可能委托 stock shadcn，不能把 `shadcn add button` 的结果冒称 ReUI；这里采用该版本完整的官方实现。

- [官方源码](https://github.com/keenthemes/reui/tree/a98dda1432a74c2e3d6680887325f859eaa32cdf/registry/default/ui)
- [官方 registry 文档](https://reui.io/docs/registry)
- [原始源码 URL/commit/SHA-256](sources.json)；此处 SHA 是**未经适配的官方源码**，不是本地文件 hash。
- [MIT 许可证](LICENSE.md)；上游编辑器版权/许可证保留在根 `LICENSE`。
- `scripts/reui/registry-v1.json` 是真实官方 registry 快照；通过 `pnpm dlx shadcn@latest view @reui/slider @reui/alert @reui/card` 等命令核对。
- `node scripts/reui/vendor.mjs slider alert card` 支持只重建指定家族；不带参数重建全部。格式化后运行全套验证，不能不经审阅覆写本地适配。

### 18类官方 ReUI 家族

| 家族               | 当前实现/适配                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| button             | 官方 Button；业务调用使用真实 variants / asChild                                                                     |
| checkbox           | 官方 Checkbox，保留 indeterminate、表格表头控制                                                                      |
| dialog             | 官方 Dialog，portal 参加 scoped reset/theme                                                                          |
| dropdown-menu      | 官方菜单；保留 dialog 内 AI 的 portalContainer                                                                       |
| input              | 官方 Input；React18 ref；增加 asChild 让 Frimousse 的真实 Search DOM 接受 ReUI Input                                 |
| label              | 官方 Label / htmlFor；新 Callout 表单实际关联标签                                                                    |
| popover            | 官方 Popover，保留 focus / keyboard / portal                                                                         |
| select             | 官方 Select；AI tone 替换原生 select                                                                                 |
| separator          | 官方 Separator                                                                                                       |
| switch             | 官方 Switch                                                                                                          |
| tabs               | 官方 Tabs                                                                                                            |
| textarea           | 官方 Textarea；AI 与 Playground 输出不再用原生 textarea                                                              |
| toggle             | 官方 Toggle；ActionButton 所有分支统一组合，不在业务直接调用 Radix Slot                                              |
| tooltip            | 官方 Tooltip / TooltipProvider                                                                                       |
| sonner             | Toast 对应官方 ReUI Sonner，通知 helper 位于 notifications.ts                                                        |
| **slider（新增）** | 官方 Slider；RGB、画笔/边框和 Playground 圆角，不是 Input type=range                                                 |
| **alert（新增）**  | 官方 Alert 组合用于可编辑 Callout 的外观；保留原有 atom/属性 schema，通过原有编辑气泡修改，不假称正文内联 contentDOM |
| **card（新增）**   | 官方 Card 用于所有建议/插件 Bubble 的浮层表面与面板；增加 React18 forwardRef 保证菜单 ref 可用                       |

## 不只是换 import 的业务重建

- ColorPicker：移除 react-colorful UI/依赖与直接 Radix，使用 Popover/Button 色板、最近色、RGB Slider 与校验后的 hex Input。
- Drawer：画布仍使用 easydrawer；工具、颜色、线宽/边框、撤销/重做/保存由 ReUI 组合。
- AI：Card/Button/Textarea/Select，保留请求取消、IME、预览、应用/丢弃和安全文本处理。
- Slash / Mention / Emoji shortcode / ShortMessage：ReUI Card 和真实 Button 选项，保留过滤、键盘和滚动。
- Emoji picker：ReUI 类别/表情 Button、真实 Input 搜索；Frimousse 仅负责数据、搜索/虚拟化/导航，不把其引擎冒称 ReUI。
- 所有库内 Bubble 的自制 border/bg/shadow 表面替换为 ReUI Card，内部动作继续用同一 ReUI 控件。
- 附件上传/重试、GIF 选项、目录跳转、lazy 失败重试、Playground 设置均为 ReUI 控件。
- 表格网格用可键盘操作的 Button 与表头 Checkbox；修复表头选项被命令覆写的问题。原生容器仅负责 pointer capture。
- SAP 重新装配本库的真正 SlashCommandList、DragHandle 与 selection bubble；不是装饰手柄或另一套 textarea。

## 必须保留的原生与外部引擎边界

最终16个业务原生例外均精确到**完整 JSX 源节点**，不是宽泛目录忽略：7个隐藏 file input、4个媒体文档选中面、4个缩放手柄、1个表格手势容器。没有业务原生 button/select/textarea/range 和业务直接 Radix。

ProseMirror 文档 DOM、NodeView contentDOM、drag/drop、resize、canvas、导出下载 anchor、打印 iframe、语义排版/SVG 不是替换为表单组件的目标。ReUI 自身可以且确实使用 Radix。

**外部引擎不谎称重写**：Excalidraw 包内部的绘图 UI、CodeMirror 编辑引擎、react-image-crop 的图片手势层、easydrawer 的 canvas，以及 Frimousse 的数据/导航引擎仍为上游依赖；本仓库拥有的宿主、弹窗、工具和动作由 ReUI 负责。没有把 Excalidraw 包里的工具条声称已换为 ReUI。

## 防止再次漏扫

`pnpm audit:ui` 遍历全部产品 TS/TSX/JS/JSX，记录 JSX/事件/imperative DOM/schema，并拒绝：

- 业务原生控件（含 native alias / createElement）、直接 Radix、旧 ui 引用/再导出；
- 把 range/color/checkbox/radio 伪装成 Input；
- 自制 bg-popover+shadow 的原生浮层表面；
- 没有精确审批的原生节点、失效的旧例外；
- 77个 package export entry 和 typesVersions 快照变动。

只有 sources.json 中**明确列名的官方源文件**可以保留 primitives 内部实现；把业务文件塞进 reui 目录仍会失败。10个正/反例测试覆盖这些规则。它是静态候选门禁，不是数学意义的“所有任意动态 JS UI 均可识别”；仍需逐文件 review 和真实交互回归。

## 兼容、许可、历史与部署

- 保持77个公开 entry、现有编辑器 schema/命令与两个演示入口；`src/components/ui` 不是 package 公共导出。
- 保留 Tailwind3 的 `richtext-` 前缀、低优先级 scoped reset、主题 tokens 和 portal 边界，不向宿主注入全局 preflight。
- 官方 v1 原语的 React19 ref-as-prop 适配到 React18/19 forwardRef，脚本可复跑。
- 来源为 [hunghg255/reactjs-tiptap-editor](https://github.com/hunghg255/reactjs-tiptap-editor)，最初上游基线 `496b849`。按用户明确确认，以补全后的代码为 main 建立全新根历史；旧 Git bundle 只在仓库外备份，不推回远程，不删除上游版权与来源。
- 只保留验证和官方 Pages Actions；没有 npm 发布或上游 release workflow。两入口以 `/reactjs-tiptap-editor/` 为 Vite base，实际部署目录是 playground/dist。
