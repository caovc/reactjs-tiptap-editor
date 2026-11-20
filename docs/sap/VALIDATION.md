> 此为首轮 SAP 历史记录；本轮恢复块能力与全仓迁移结果见 [最新验证](../reui/VALIDATION_COMPLETION.md)。

# SAP Studio 验证记录

## 环境与范围

- 验证日期：2026-11-20（Asia/Shanghai，UTC+8）。Node 24.22.1，项目包管理器 pnpm 8.15.9。
- 起点 `743e028`；开始时工作树干净，HEAD 与 `origin/main` 一致。实现限于同仓库独立 SAP 入口、构建配置、测试与文档，未修改原 Playground 实现或库扩展代码。
- `name/version/exports/typesVersions/main/module/types/peerDependencies/private/packageManager` 与起点逐项相等，保留 77 个导出与 `private: true`；不新增 npm 发布工作流。

## 本地门禁

| 检查                             | 结果 / 证据                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | 通过；沿用 v6 lockfile 与项目 pnpm 8                                                     |
| `pnpm lint`                      | 零错误，76 个既有警告；SAP 源码与新浏览器测试单独 oxlint 零警告                          |
| `pnpm type-check`                | 通过，原库类型保持                                                                       |
| `pnpm build:lib`                 | 通过，ESM/CJS/声明正常生成（运行时 CJS 互操作问题见下）                                  |
| `pnpm type-check:sap`            | 通过，单独严格检查 SAP 与其 ReUI 源码依赖；CI 在构建库之后执行，避免依赖未生成声明       |
| `pnpm test:types`                | 通过                                                                                     |
| `pnpm test:unit`                 | 22 / 22 通过（AI 客户端、iframe、KaTeX loader、locale、语法高亮、Word 序列化等既有测试） |
| Pages 子路径生产构建             | 通过；根 Playground 与 `sap/index.html` 双入口、真实 `/reactjs-tiptap-editor/` base      |
| `pnpm test:browser`              | 25 / 25 通过：原有 12 项 + 新增 SAP 13 项（Chromium headless，非登录浏览器）             |
| 包入口隔离                       | 2 项 ESM tree-shaking 检查通过；1 项既有 CJS 运行时检查失败，非新增回归                  |
| 格式 / diff                      | 新增源码 oxfmt 检查通过；`git diff --check` 通过                                         |

### 既有 CJS 限制（不得混称全绿）

`node --test tests/bundle-isolation.test.mjs` 仍是 **2 pass / 1 fail**：
`all bubble entry points expose matching ESM/CJS exports and declarations` 在 `lib/Italic.cjs` 触发 `TypeError: a.default.extend is not a function`。

这是上一次迁移已在干净上游 `496b849` 复现的 Tiptap default-import CJS 互操作基线，详见 [ReUI 验证](../reui/VALIDATION.md)。本次没有修改相关源文件。Pages Actions 保留显式非阻断探针，并阻断式检查 ESM 隔离；不是把失败隐藏成成功。SAP 与原 Playground 使用已通过测试的浏览器 ESM 路径。

## SAP 13 项真实行为覆盖

1. 生产入口、15 个初始标题、正文自动编号，桌面 1440×1000 / 窄屏 390×844 截图。
2. 输入正文、粗体、Arial、18px、文字颜色、标题 2；标题更改实时更新目录，点击后光标定位；撤销 / 重做。
3. JSON schema 结构化估计目标区块插入、撤销；真实表格插入、加行、删行与保存。
4. 方案元数据、增改术语、插入术语表；刷新恢复正文与术语，稳定章节 ID 不变。
5. 真实选择文字建立批注、正文前插入文字不丢锚点；处理 / 重新打开、刷新、定位；删除锚点明确提示，撤销恢复。
6. Ctrl+F、匹配计数与定位、纯文本批量替换；`<script>` 替换值不创建脚本节点，撤销恢复。
7. 真实 JSON 和 HTML 下载；JSON 往返、导入确认 / 取消、非法文件不改当前文档、HTML 正文往返。
8. HTML 脚本 / 事件 / 图片 / iframe / 链接 / CSS 外链清除；无注入标记、无恶意目标请求；JSON 非法 CSS 与损坏表格拒绝。
9. 待填规则定位、修改后实时清除；重置必须确认，取消不丢编辑。
10. 100% / 65% 实际缩放、15mm 实际边距；打印媒体隐藏 chrome、取消屏幕缩放和纸张二次内边距；真实 Chromium PDF 生成。
11. 损坏的 localStorage 草稿保持原始字节、不被演示副本静默覆盖。
12. 第二标签页更新时，第一标签页暂停保存，不覆盖未见变更。
13. 窄屏进入目录、跳转、编辑方案元数据、关闭面板和缩放；浏览器主体无横向溢出（纸张画布内部允许横向滚动）。

每项 SAP 测试均监听 pageerror、console error 与同源 HTTP ≥400，全部为零。原 Playground 的主题 / portal、中文、只读、格式、搜索、图片和错误 toast 回归也通过；另有原 ReUI 15 家族控件与既有扩展场景。

## Visual QA 与打印

来源真值为 [Reference lock](DESIGN.md)，不是未取得的 Refero 屏幕图。已读取并人工对照实际截图：

| 证据（工作目录下，相对路径）            | 结论                                                                                                                          |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `test-results/sap-desktop.png`          | 灰白专业三栏、紧凑分组 ribbon、单一蓝色强调、真实白纸。修复继承的 ProseMirror 80px 二次内缩，正文与封面对齐。无 P0/P1/P2 漂移 |
| `test-results/sap-mobile.png`           | 非营销页；功能区可横滚，固定纸张在画布内横滚；主页面不溢出，缩放和面板按钮可达                                                |
| `test-results/sap-mobile-assistant.png` | 窄屏助手可完整操作，元数据输入焦点清楚，面板内部滚动；可关闭回正文                                                            |
| `test-results/sap-review.png`           | 已处理的本地意见、真实正文锚点、可编辑意见与重新打开操作均可见                                                                |
| `test-results/sap-print.pdf`            | 实际打印产物；pdfinfo：4 页，A4（约 594.96×841.92pt），无 PDF JavaScript；不是 CSS 背景伪分页                                 |

已修复验证中发现的实际问题：导入空样式与真实 table `align` 属性适配、明确的历史操作边界、词汇对话框插入选区保留、窄边距打印优先级、provider reset 的打印外框、CSS 属性白名单及表格网格分配上限。未用强制点击、任意等待或跳过失败测试掩盖问题。

## Pages 与线上检查

- SAP：<https://caovc.github.io/reactjs-tiptap-editor/sap/>
- 原 Playground：<https://caovc.github.io/reactjs-tiptap-editor/>
- 官方 Pages Actions：<https://github.com/caovc/reactjs-tiptap-editor/actions/workflows/pages.yml>
- 该 workflow 对提交重新执行库 / SAP 类型、构建、单元与全部浏览器门禁，再以官方 configure-pages / upload-pages-artifact / deploy-pages 发布。浏览器截图 / PDF 作为 `browser-evidence` 保留 7 天。
- 本表本地结果不代替线上状态；本次提交的实际运行链接、最终 commit、部署结论与线上 HTTP / 交互烟雾验证在交付报告中提供，Actions 中保留独立日志。

## 未覆盖与局限

未验证 Safari / Firefox、屏幕阅读器人工巡检、复杂 Word 文件兼容性、实际打印机和多系统字库差异。仅 Chromium 的桌面和窄屏行为及 PDF 已验证。Refero MCP 返回 `NO_SUBSCRIPTION`，未获得外部 styles/screens；已明确记录并遵循既有 ReUI 与用户 Word 式约束直接构建，没有冒称完成 Refero 参考研究。

没有屏幕动态分页 / 页码 / DOCX 承诺 / 修订追踪 / 协作 / 签名 / 合规或统计计算；详细边界见 [README](README.md)。
