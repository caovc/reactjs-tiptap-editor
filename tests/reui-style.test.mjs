import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
const audit = path.resolve('scripts/reui/style-contract.mjs');
function fixture(source) {
  const dir = mkdtempSync(path.join(tmpdir(), 'reui-css-contract-'));
  try {
    writeFileSync(path.join(dir, 'Plugin.tsx'), source);
    return spawnSync(process.execPath, [audit, `--source=${dir}`], { encoding: 'utf8' });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
test('actual Tailwind3 compiler generates translated ReUI state, selector and arbitrary-value utilities', () => {
  const r = fixture(
    `<div className="aria-[invalid=true]:richtext-border-destructive data-[disabled]:richtext-opacity-50 [[data-invalid=true]_&]:richtext-ring-destructive/10 [&>[data-slot=alert-icon]]:richtext-mt-0.5 richtext-ease-reui richtext-backdrop-blur-[4px] richtext-max-w-[var(--frimousse-viewport-width)]" />`
  );
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(JSON.parse(r.stdout).generatedUtilities >= 7);
});
test('a future plugin cannot silently ship ungenerated namespace utilities or claim an existing semantic exception', () => {
  for (const utility of [
    'richtext-outline-hidden',
    'data-disabled:richtext-opacity-50',
    'richtext-ai-send',
  ]) {
    const r = fixture(`<div className="${utility}" />`);
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.equal(JSON.parse(r.stdout).unsupported[0].token, utility);
  }
});
