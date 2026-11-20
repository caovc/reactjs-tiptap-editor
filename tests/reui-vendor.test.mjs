import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';

import ts from 'typescript';

test('all 18 official ReUI snapshots match their recorded original-source hashes', () => {
  const manifest = JSON.parse(fs.readFileSync('docs/reui/sources.json', 'utf8'));
  const registry = JSON.parse(fs.readFileSync('scripts/reui/registry-v1.json', 'utf8'));
  assert.equal(manifest.length, 18);
  for (const item of manifest) {
    assert.equal(item.revision, 'a98dda1432a74c2e3d6680887325f859eaa32cdf');
    const source = registry
      .find((x) => x.name === item.component)
      .files.find((x) => x.type === 'registry:ui');
    assert.equal(
      crypto.createHash('sha256').update(source.content).digest('hex'),
      item.sha256,
      item.component
    );
  }
});
test('targeted vendoring reproduces refs, Input Slot and viewport-bounded overlays without touching other components', () => {
  const root = process.cwd();
  fs.mkdirSync(`${root}/.verification`, { recursive: true });
  const dir = fs.mkdtempSync(`${root}/.verification/reui-vendor-check-`);
  try {
    fs.mkdirSync(`${dir}/src/components/reui`, { recursive: true });
    fs.mkdirSync(`${dir}/docs/reui`, { recursive: true });
    fs.copyFileSync('docs/reui/sources.json', `${dir}/docs/reui/sources.json`);
    fs.writeFileSync(`${dir}/src/components/reui/button.tsx`, 'sentinel: do not overwrite');
    execFileSync(
      process.execPath,
      [`${root}/scripts/reui/vendor.mjs`, 'input', 'slider', 'alert', 'card', 'dialog', 'popover'],
      { cwd: dir }
    );
    for (const name of ['input', 'slider', 'alert', 'card', 'dialog', 'popover']) {
      const text = fs.readFileSync(`${dir}/src/components/reui/${name}.tsx`, 'utf8');
      assert.equal(
        ts.createSourceFile(`${name}.tsx`, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
          .parseDiagnostics.length,
        0,
        name
      );
      if (name === 'popover') {
        assert.ok(
          text.includes('richtext-max-w-[calc(100vw-1rem)]'),
          'Popover retains viewport width contract'
        );
        assert.ok(
          text.includes('richtext-overflow-y-auto'),
          'Popover scrolls within available height'
        );
      }
      if (name === 'dialog') {
        assert.ok(
          text.includes('richtext-max-h-[calc(100dvh-2rem)]'),
          'Dialog retains viewport height contract'
        );
        assert.ok(
          text.includes('richtext-w-[calc(100vw-2rem)]'),
          'Dialog retains narrow-screen gutters'
        );
      }
      if (name === 'input') {
        assert.ok(/asChild = false/.test(text), 'Input consumes asChild');
        assert.ok(/const Comp = asChild/.test(text), 'Input declares actual Slot/native target');
        assert.ok(/<Comp ref=/.test(text), 'Input forwards the actual DOM ref');
      }
      if (['card', 'slider'].includes(name))
        assert.ok(/React.forwardRef/.test(text), `${name}: React18 ref boundary`);
    }
    assert.equal(
      fs.readFileSync(`${dir}/src/components/reui/button.tsx`, 'utf8'),
      'sentinel: do not overwrite'
    );
    assert.equal(JSON.parse(fs.readFileSync(`${dir}/docs/reui/sources.json`, 'utf8')).length, 18);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
