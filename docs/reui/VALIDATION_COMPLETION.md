# 全仓 ReUI 补全与 SAP 块编辑：真实验证

2026-11-20（北京时间，UTC+8）。此记录在本轮提交前生成；远程部署结果与 commit/run URL 以对应 Actions 和交付报告为准，不把预期的未来部署写成已通过。

## 根因与修正范围

第一轮盘点仅以基础 UI 目录和组件符号为依据，把“15个家族替换”错误外推成“全仓完成”。实际遗漏了业务自己画出的按钮/表单/色板、直接 Radix 的 asChild 分支、建议列表和浮层表面，以及默认 Playground 未启用的插件。SAP 又只装配了 Word 功能区，没装配库已有的块交互。

这次以旧 main `01db11df5b7ac42fe2499b41b9a7961fdeb44319` 为只读基线：

- 全量遍历356个基线、345个当前产品源码模块（含157个当前 JSX 文件），逐文件映射并集363条；另列53个样式、HTML、文档宿主与构建/发布入口。
- 原业务68个原生控件位置降至7个隐藏file桥；55个 button、3个 range、2个 textarea、1个 select 的源码位置不再是业务原生控件。这里是**源码位置**，不是 map 后运行时控件数量。
- 原生点击/指针容器20→9：9处非语义点击改成真实 ReUI 控件，2处无意义空点击移除；9处必要媒体/缩放/网格手势保留。
- 4处业务直接 Radix 引用、42处旧 UI 路径引用清零；18个旧 `src/components/ui` 文件移除。当前18类官方 ReUI，新增 Slider/Alert/Card；源 URL、原始 SHA 和 React18/作用域适配可核查。
- 不只改 import：重建颜色/RGB/hex、绘图工具、AI 表单、表情外围、建议项、表格按钮/表头、附件/GIF/目录/错误重试，以及编辑器主体 Card/Header/Content、全部插件 Bubble 与建议面板的真实 Card 表面。
- `pnpm audit:ui` 可复跑；10个正/反例门禁用例防止新目录原生控件、别名、createElement、直接 Radix、旧再导出、伪装 Input、手绘 popup 或伪装放进 reui 目录；精确例外失效也失败。另2个用例验证18个官方原始 SHA 和定向 vendor 重建/Slot/Card-ref 适配。
- 逐文件对照及修改/静态证据等级见 [FULL_AUDIT.md](FULL_AUDIT.md)，不把所有已审计或格式化路径冒称为重写组件。

逐文件新增/删除行数另存 `full-audit/change-stats.json`（相对旧main，排除派生审计文件自身，包含格式化；不把行数冒称功能数量）。

## 本地最终命令结果

| 命令 / 路径 | 结果 |
| --- | --- |
| `pnpm --version` | 8.15.9，与 packageManager 一致 |
| `pnpm install --frozen-lockfile` | 通过 |
| `pnpm audit:ui` | 通过，16个精确业务原生例外；无未批准候选；77个公开 entry/typesVersions 不变 |
| `pnpm lint` | 退出0；76个基线 warning，按路径+warning内容比对没有新增（不只比较总数） |
| `pnpm type-check` | 通过 |
| `pnpm build:lib` | 通过，既有 mixed exports/build timing 警告仍存在 |
| `pnpm type-check:sap` | 通过 |
| `pnpm test:types` | 通过 |
| `pnpm test:unit` | 22个原单元 + 12个新增门禁/来源测试，合计34通过 |
| `PAGES_BASE_PATH=/reactjs-tiptap-editor/ pnpm --dir playground build` | 双入口静态构建通过 |
| `pnpm test:browser` | 41通过（源fixture + 真实生产构建；fresh headless Chromium） |
| `node --test tests/bundle-isolation.test.mjs` | 2通过 / 1已知基线失败：CJS Italic 的 `a.default.extend is not a function`；上游496b849已复现，未删测试，CI继续保留 non-blocking probe。ESM隔离检查通过 |

### 真实浏览器覆盖，不只是截图

- 原有25项全部保留：官方 ReUI controls/focus/overlay/主题、原 Playground 格式/撤销/标题/搜索替换/图片/错误通知，lazy/two-editor/Word/Drawer/Emoji/KaTeX/AI mock，以及13条完整 SAP 流程。
- 插件新增9条：RGB slider键盘/hex非法值/最近色/重置；表格键盘尺寸和真实TH；mention键盘与短语点击；真实canvas绘图像素变化、形状、线宽、撤销/重做/保存；表情短码/搜索；有效图片filechooser与iframe；潜藏附件chooser/upload/delete、GIF和TOC；Callout类型/属性编辑Dialog/Alert；实际编辑器框架下块菜单移动/撤销且不被边框裁切。
- SAP块新增7条：slash过滤/方向键/Enter与安全SAP块插入；块前后插入/移动/撤销/转换/重复/删除；**75%/100%/125%真实HTML5拖拽**改变文档顺序并可撤销（3条）；窄屏75% hover/menu/selection bubble/print；重排保留章节ID/批注、复制不复用锚点并刷新恢复。
- 覆盖 Console/pageerror 与同源资源失败检查；静态构建使用真实 Pages 子路径。不存在通过执行持久登录浏览器或读取登录凭据来测试。

### 测试真正发现并修复的问题

- 原表格命令无视表头选项；已遵从 ReUI Checkbox。
- grip 的普通按钮 mousedown preventDefault 阻止原生拖拽；只在真实 drag grip 关闭保留选择区行为。
- Tiptap默认非nested拖拽在zoom下重新命中错误块；使用官方 nested rules 限制到depth1，取已有hover文档位置，实际75/100/125测试通过。没有补丁 node_modules。
- hover不应抢光标、空段落加号slash位置、块移动的独立撤销边界、重复时ID/批注元数据、selection bubble缩放层叠定位均修复。
- 官方 v1 Card 需要React18 ref适配，确保真实菜单容器ref不丢；生成脚本的Input多行签名适配错误由重建测试发现并修复（fail closed）。
- 截图自检发现桌面缩到700px仍同时保留两侧面板遮挡文档；跨入窄屏时关闭面板，仍可逐个手动打开。
- Callout原本是atom属性节点，不是正文内联contentDOM；测试通过原有编辑Bubble实际修改属性，未为测试擅改schema。ReUI severity token作scoped适配保留警告/提示颜色。

## 例外与没有假装完成的部分

16个原生位置及理由在 `scripts/reui/native-exceptions.json`，分别是7个隐藏文件桥、4个文档媒体选中面、4个resize手柄、1个表格手势容器。其余语义文档DOM/ProseMirror、canvas、打印iframe与下载anchor不是应强改为表单组件的UI。保留的Vue/VitePress文档站只含语义布局/链接与上游文档引擎，不在本Pages artifact内；未冒称将该第三方Vue引擎重写成React ReUI。其宿主文件另列入支持边界清单。

Excalidraw包内部工具条、CodeMirror引擎、react-image-crop的裁剪手势、easydrawer canvas、Frimousse数据/搜索/虚拟化引擎没有冒称重写；本仓库拥有的外围/工具/弹窗组合已改ReUI。GIF外部HTTP、附件上传和AI服务使用确定性fixture/mock，不代表第三方API线上可用性；剪贴板权限、每种上传失败、每个插件每条分支、全部浏览器/系统/触摸手势未穷尽。具体逐文件运行证据与静态-only项分开列在映射中。

SAP以顶层文档块重排；不提供嵌套表格/列表项单独拖拽、多块框选或跨编辑器拖拽承诺。缩放选择仍40%–150%，拖拽回归覆盖75/100/125；不谎称每个比例都测过。其他语言的新块命令使用英文fallback，中文SAP有完整中文标签。

SAP仍为连续A4 + 浏览器真实打印分页，无屏幕动态分页/DOCX兼容/修订追踪/多人协作/电子签名/GxP合规。结构检查不验证统计方法；示例完全虚构，禁止真实患者信息。本地数据不上传。

## 截图与设计核对

本机 `test-results/`：`reui-playground.png`、`reui-dark-dialog.png`、`reui-color-controls.png`、`reui-drawing-dialog.png`、`reui-callout.png`、`sap-desktop.png`、`sap-mobile.png`、`sap-blocks-desktop.png`、`sap-blocks-narrow.png`。稳定备份在 `.verification/final-evidence/`（不提交生成产物）。Actions保存browser-evidence artifact 7天。

已Read实际截图并核对既定 `docs/sap/DESIGN.md`：灰白紧凑工具栏/分组、白色连续纸张、左右辅助区、无营销大卡片；块操作与选区浮层可用，窄屏可关闭辅助区。原Refero `NO_SUBSCRIPTION` 限制不被这次自检冒称为成功外部参考研究。

## CI / Pages / 历史

两条workflow均执行全源审计，Pages还执行全部类型/单元/浏览器与双入口构建，再经官方configure/upload/deploy-pages。上游npm发布workflow不在仓库内。

用户明确确认覆盖main历史；实施前核对origin main不含他人新增，仓库外保存Git bundle后建立新根，**只**对main做带明确期望SHA的force-with-lease，不删除其他分支/tag/设置，不跳hooks/保护。许可证和上游/ReUI来源留在树内。本记录不预先宣称未来push/CI成功；最终SHA、history计数、备份位置和线上实测在交付报告核验。
