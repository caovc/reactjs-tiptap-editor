import { expect, test } from '@playwright/test';

const fixtures = [
  {
    name: 'lazy dialogs, two-editor isolation, Word and Drawer',
    file: 'bundle-loading',
    done: /ALL \d+ CHECKS PASSED|FAIL/,
  },
  { name: 'lazy KaTeX and Emoji', file: 'bundle-features', done: /ALL \d+ CHECKS PASSED|FAIL/ },
  {
    name: 'toolbar subscriptions and read-only state',
    file: 'toolbar-performance',
    done: /editable state restores controls|FAIL/,
  },
  {
    name: 'AI mock preview, apply/discard and safe text',
    file: 'ai-editor',
    done: /discard long preview preserves following content|FAIL/,
  },
];
for (const fixture of fixtures) {
  test(`existing browser checks: ${fixture.name}`, async ({ page }) => {
    await page.goto(`http://127.0.0.1:5199/tests/${fixture.file}.html`);
    const results = page.locator('#results');
    await expect(results).toContainText(fixture.done, { timeout: 25_000 });
    await expect(results).not.toContainText('FAIL');
    await expect(results).toContainText('PASS');
  });
}
