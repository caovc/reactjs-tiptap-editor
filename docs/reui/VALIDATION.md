> **历史记录：第一轮基础控件迁移。不能作为全仓完成证据；当前补全与限制见 [VALIDATION_COMPLETION.md](VALIDATION_COMPLETION.md) 和 [FULL_AUDIT.md](FULL_AUDIT.md)。**

# Verification results

Validated on 2026-11-19 (Asia/Shanghai), with Node 24.22.1 and the project's
`pnpm@8.15.9` package manager. These are results from the actual built artifact
and real headless Chromium, not just a source review.

| Check | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm type-check` | PASS |
| `pnpm build:lib` | PASS; ESM, CJS and declarations emitted |
| `pnpm test:types` (after library build) | PASS |
| Public package metadata comparison with upstream | All 77 export paths, typesVersions, entry points and React peer ranges unchanged |
| `pnpm lint` | PASS, zero errors; 76 existing warnings versus 78 on clean upstream (two obsolete empty-interface warnings removed) |
| Oxfmt check on changed/new code | PASS |
| `pnpm test:unit` | 22 tests PASS, zero failures |
| `PAGES_BASE_PATH=/reactjs-tiptap-editor/ pnpm --dir playground build` | PASS |
| `pnpm test:browser` | 12 Playwright tests PASS |
| Existing ESM text-bubble isolation checks | 2 PASS |
| Existing CJS bubble export compatibility check | **Known upstream failure**, independently reproduced on clean upstream; see below |
| `git diff --check` | PASS |

## Browser coverage

The two control-fixture tests exercise all 15 migrated UI families, including
forwarded input/asChild-button refs, native inputs/textarea, labels, checkbox,
switch, select, separator, toggle, tabs, dropdown selection, popover, dialog
viewport placement/borders/autofocus/Escape/focus restoration, tooltip and
button styles. Sonner creation, destructive variant, update and dismissal
(including stable string identifiers) are exercised as well.

Six tests run against the **production playground build at the GitHub Pages
subpath**, covering text formatting/undo, toolbar tooltips, heading menu,
search/replace, lazy image dialog/tabs/inline checkbox/alt input/local image
insertion, light/dark theme and portaled theme tokens, Chinese localization,
read-only behavior, and invalid-file notification. These covered production
flows assert zero JavaScript/console errors and zero first-party HTTP errors;
script/style URLs are checked for the repository prefix.

Four tests execute the repository's existing automatic browser fixtures:

- `bundle-loading`: lazy image/video dialogs, two-editor isolation, Word
  export/import and Drawer create/reopen/edit.
- `bundle-features`: lazy KaTeX/Emoji and rendering/retry safety.
- `toolbar-performance`: toolbar subscriptions, formatting, attributes, undo,
  storage-only refresh and editable/read-only updates. No speedup is claimed.
- `ai-editor`: mocked AI streaming, safe text, apply/discard, selection invalidation
  and preview layout. No external AI request is sent.

Screenshots are produced locally at `test-results/reui-dark-dialog.png` and
`test-results/reui-playground.png`; artifacts are intentionally not committed.

## Known upstream CJS issue (not hidden)

`node --test tests/bundle-isolation.test.mjs` has 2 passes and 1 failure:
`all bubble entry points expose matching ESM/CJS exports and declarations`.
Node CJS loading reaches the Tiptap default-import interop problem
`TypeError: a.default.extend is not a function` in `lib/Italic.cjs`.

The exact same error was independently reproduced by building a clean detached
worktree of upstream commit `496b849`. It is not introduced by the ReUI migration.
The ESM/browser entry points and public TypeScript checks pass. This migration
keeps the upstream export contract rather than rewriting unrelated Tiptap
extension imports. The Pages workflow gates the ESM isolation checks and exposes
the known CJS check as an explicitly named non-blocking step. It is incorrect to
say every existing test passes or that all CJS consumers are verified.

## Limits and deployment

- Browser verification uses Chromium/React 19; Firefox, WebKit, mobile and a
  separate React 18 runtime matrix were not run. DOM-facing controls retain
  React 18-compatible forwardRef boundaries, and the peer ranges are unchanged.
- Every migrated control family is exercised, but not every combination of
  editor extensions, rapid interaction order, upload provider, remote media URL
  or export option is exhaustively tested.
- The full playground still has upstream large-chunk build warnings. This task
  does not claim a bundle-size or performance improvement.
- The existing KaTeX safety fixture intentionally produces a strict-mode LaTeX
  warning for malformed input; it is not an application console error.
- ReUI is pinned to official MIT-licensed v1, not the latest registry's stock
  shadcn dependency set. The custom Frimousse emoji adapter remains unchanged.
- npm publication is blocked with `private: true` and the unrelated upstream
  npm/release/preview workflows are removed. GitHub Pages is the only deployment.

The deployment workflow is [Playground Pages](../../.github/workflows/pages.yml).
Its build and browser gates must pass before the official Pages deployment job.
See the repository's Actions tab for the actual deployment conclusion.
