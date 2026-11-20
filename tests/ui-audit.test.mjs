import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = process.cwd();
function fixture(source, file = "src/new/plugin.tsx", exceptions = []) {
  fs.mkdirSync(path.join(root, ".verification"), { recursive: true });
  const dir = fs.mkdtempSync(
    path.join(root, ".verification", "reui-audit-test-"),
  );
  for (const name of [
    "src/new",
    "playground/src",
    "docs/reui/full-audit",
    "scripts/reui",
  ])
    fs.mkdirSync(path.join(dir, name), { recursive: true });
  fs.copyFileSync(
    path.join(root, "docs/reui/sources.json"),
    path.join(dir, "docs/reui/sources.json"),
  );
  fs.copyFileSync(
    path.join(root, "docs/reui/full-audit/public-api.json"),
    path.join(dir, "docs/reui/full-audit/public-api.json"),
  );
  fs.copyFileSync(
    path.join(root, "package.json"),
    path.join(dir, "package.json"),
  );
  const vendors = JSON.parse(
    fs.readFileSync(path.join(root, "docs/reui/sources.json"), "utf8"),
  );
  fs.mkdirSync(path.join(dir, "src/components/reui"), { recursive: true });
  for (const vendor of vendors)
    fs.copyFileSync(
      path.join(root, `src/components/reui/${vendor.component}.tsx`),
      path.join(dir, `src/components/reui/${vendor.component}.tsx`),
    );
  fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
  fs.writeFileSync(path.join(dir, file), source);
  fs.writeFileSync(
    path.join(dir, "scripts/reui/native-exceptions.json"),
    JSON.stringify(exceptions),
  );
  try {
    const result = spawnSync(
      process.execPath,
      [path.join(root, "scripts/reui/full-audit.mjs"), "--check"],
      { cwd: dir, encoding: "utf8" },
    );
    return { status: result.status, output: result.stdout + result.stderr };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
for (const [name, source, kind] of [
  [
    "custom popup surface",
    'export const Plugin=()=> <div className="richtext-bg-popover richtext-shadow-md" />',
    "native-surface",
  ],
  [
    "raw controls",
    "export const Plugin=()=> <button>Bypass</button>",
    "native-control",
  ],
  [
    "aliased native controls",
    "const Tag='button'; export const Plugin=()=> <Tag>Bypass</Tag>",
    "native-control",
  ],
  [
    "imperative native controls",
    "export const Plugin=()=> document.createElement('button')",
    "native-construction",
  ],
  [
    "direct Radix",
    "import { Dialog } from 'radix-ui'; export const Plugin=()=> <Dialog.Root />",
    "direct-radix",
  ],
  [
    "legacy UI reexports",
    "export * from '@/components/ui/button'",
    "legacy-ui-import",
  ],
  [
    "native slider disguised as Input",
    "import {Input} from '@/components/reui/input';export const Plugin=()=> <Input type='range' />",
    "wrong-primitive",
  ],
])
  test(`UI audit rejects ${name} in a new, previously unknown plugin`, () => {
    const result = fixture(source);
    assert.equal(result.status, 1, result.output);
    assert.match(result.output, new RegExp(kind));
  });
test("UI audit does not exempt arbitrary business code placed in the ReUI directory", () => {
  const result = fixture(
    "export const Fake=()=> <button />",
    "src/components/reui/lookalike.tsx",
  );
  assert.equal(result.status, 1, result.output);
});
test("UI audit accepts actual ReUI composition", () => {
  const result = fixture(
    "import {Button} from '@/components/reui/button';export const Plugin=()=> <Button>Action</Button>",
  );
  assert.equal(result.status, 0, result.output);
});
test("UI audit permits only the exact documented native file bridge", () => {
  const source = "export const Plugin=()=> <input type='file' hidden />";
  assert.equal(fixture(source).status, 1);
  const exceptions = [
    {
      file: "src/new/plugin.tsx",
      kind: "native-control",
      detail: "<input type='file' hidden />",
      reason: "Hidden browser File bridge, activated by a ReUI upload button.",
    },
  ];
  const allowed = fixture(source, "src/new/plugin.tsx", exceptions);
  assert.equal(allowed.status, 0, allowed.output);
  const stale = fixture(
    "export const Plugin=()=> null",
    "src/new/plugin.tsx",
    exceptions,
  );
  assert.equal(stale.status, 1);
  assert.match(stale.output, /stale/);
});
