import { expect, test } from '@playwright/test';

let errors: string[];
let missing: string[];
test.beforeEach(async ({ page }) => {
  errors = [];
  missing = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && new URL(response.url()).origin === new URL(page.url()).origin)
      missing.push(`${response.status()} ${response.url()}`);
  });
  await page.goto('./');
  await expect(page.locator('.ProseMirror')).toBeVisible();
  await page.getByRole('button', { name: 'English', exact: true }).click();
});
test.afterEach(() => {
  expect(errors, 'No runtime/console errors').toEqual([]);
  expect(missing, 'No missing first-party resources').toEqual([]);
});

test('production assets, tooltip, formatting and undo', async ({ page }) => {
  const editor = page.locator('.ProseMirror');
  await page.getByRole('button', { name: 'Headings', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: /^Heading 2/ }).click();
  await page.getByRole('button', { name: 'Headings', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: /^Paragraph/ }).click();
  await editor.fill('ReUI editor');
  await editor.press('ControlOrMeta+a');
  const bold = page.getByRole('button', { name: 'Bold', exact: true });
  await bold.hover();
  await expect(page.getByRole('tooltip', { name: /^Bold/ })).toContainText('Bold');
  await bold.click();
  await expect(editor.locator('strong')).toHaveText('ReUI editor');
  await page.getByRole('button', { name: 'Italic', exact: true }).click();
  await expect(editor.locator('em')).toHaveText('ReUI editor');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(editor.locator('em')).toHaveCount(0);
  await expect(editor.locator('strong')).toHaveText('ReUI editor');
  const assets = await page
    .locator('script[src], link[rel=stylesheet]')
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('src') || element.getAttribute('href'))
    );
  expect(assets.length).toBeGreaterThan(0);
  expect(assets.every((url) => url?.startsWith('/reactjs-tiptap-editor/'))).toBe(true);
});

test('heading dropdown', async ({ page }) => {
  const editor = page.locator('.ProseMirror');
  await editor.fill('ReUI editor');
  await page.getByRole('button', { name: 'Headings', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: /^Heading 2/ }).click();
  await expect(editor.locator('h2')).toHaveText('ReUI editor');
});

test('search/replace popover', async ({ page }) => {
  const editor = page.locator('.ProseMirror');
  await editor.fill('ReUI editor');
  await page.getByRole('button', { name: 'Search and Replace', exact: true }).click();
  const popover = page.locator('[data-slot=popover-content]');
  await expect(popover).toBeInViewport();
  await popover.getByRole('checkbox').check();
  await expect(popover.getByRole('checkbox')).toBeChecked();
  await popover.getByPlaceholder('Text').nth(0).fill('ReUI');
  await popover.getByPlaceholder('Text').nth(1).fill('Migrated');
  await popover.getByRole('button', { name: 'Replace All', exact: true }).click();
  await expect(editor).toContainText('Migrated editor');
  await page.keyboard.press('Escape');
});

test('lazy image dialog, tabs, checkbox, inputs and insert', async ({ page }) => {
  await page.getByRole('button', { name: 'Image', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Add an image' });
  await expect(dialog).toBeInViewport();
  await expect(dialog).toHaveCSS('border-top-style', 'solid');
  await dialog.getByRole('checkbox').check();
  await expect(dialog.getByRole('checkbox')).toBeChecked();
  await dialog.getByRole('tab', { name: 'Url', exact: true }).click();
  await dialog.getByRole('textbox').nth(0).fill('ReUI icon');
  const imageURL = new URL('vite.svg', page.url()).href;
  await dialog.locator('input[type=url]').fill(imageURL);
  await dialog.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  const image = page.locator('.ProseMirror img[alt="ReUI icon"]');
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate((element) => element instanceof HTMLImageElement && element.naturalWidth > 0)
    )
    .toBe(true);
});

test('editor theme, portaled theme, localization and read-only state', async ({ page }) => {
  const root = page.locator('.reactjs-tiptap-editor');
  const light = await root.evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--background')
  );
  await page.getByRole('button', { name: 'Theme dark', exact: true }).click();
  await expect
    .poll(() =>
      root.evaluate((element) => getComputedStyle(element).getPropertyValue('--background'))
    )
    .not.toBe(light);
  await page.getByRole('button', { name: 'Image', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Add an image' });
  await expect(dialog).toBeInViewport();
  const dark = await root.evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--background')
  );
  expect(
    await dialog.evaluate((element) => getComputedStyle(element).getPropertyValue('--background'))
  ).toBe(dark);
  await page.screenshot({ path: 'test-results/reui-dark-dialog.png', fullPage: true });
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'Theme light', exact: true }).click();
  await expect
    .poll(() =>
      root.evaluate((element) => getComputedStyle(element).getPropertyValue('--background'))
    )
    .toBe(light);
  await page.getByRole('button', { name: 'Chinese', exact: true }).click();
  await expect(page.getByRole('button', { name: '粗体', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.getByRole('button', { name: 'Editable', exact: true }).click();
  await expect(page.locator('.ProseMirror')).toHaveAttribute('contenteditable', 'false');
  await expect(page.getByRole('button', { name: 'Bold', exact: true })).toBeDisabled();
  await page.screenshot({ path: 'test-results/reui-playground.png', fullPage: true });
});

test('invalid image upload surfaces an accessible Sonner error', async ({ page }) => {
  await page.getByRole('button', { name: 'Image', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Add an image' });
  await dialog
    .locator('input[type=file]')
    .last()
    .setInputFiles({
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('invalid image'),
    });
  await expect(
    page.getByText('invalid.txt file type not supported', { exact: true })
  ).toBeVisible();
  await expect(page.locator('[data-sonner-toast]')).toBeVisible();
});
