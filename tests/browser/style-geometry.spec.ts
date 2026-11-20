import { expect, test, type Locator, type Page } from '@playwright/test';

import type { Editor } from '@tiptap/core';

declare global {
  interface Window {
    editor?: Editor | null;
  }
}
let errors: string[];
test.beforeEach(({ page }) => {
  errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().startsWith(new URL(page.url()).origin))
      errors.push(`${response.status()} ${response.url()}`);
  });
});
test.afterEach(() =>
  expect(errors, 'No runtime, console or first-party resource errors').toEqual([])
);

async function box(locator: Locator) {
  const rect = await locator.boundingBox();
  if (!rect) throw Error(`Missing geometry: ${locator}`);
  return rect;
}
async function inViewport(page: Page, locator: Locator) {
  await expect
    .poll(
      async () => {
        const r = await box(locator),
          viewport = page.viewportSize();
        if (!viewport) throw Error('Missing viewport');
        return (
          r.x >= 0 &&
          r.y >= 0 &&
          r.x + r.width <= viewport.width &&
          r.y + r.height <= viewport.height
        );
      },
      { message: 'Floating surface fits the viewport, not just visible=true' }
    )
    .toBe(true);
}
async function paperHandle(page: Page, target: Locator, zoom: number) {
  await expect
    .poll(
      async () => {
        const [paper, block, handle] = await Promise.all([
          box(page.locator('.sap-paper')),
          box(target),
          box(page.locator('[data-block-handle]')),
        ]);
        const gap = block.x - (handle.x + handle.width);
        return {
          insidePaper: handle.x >= paper.x + 0.5 && handle.x + handle.width < paper.x + paper.width,
          besideTarget: gap >= (2 * zoom) / 100 && gap <= (7 * zoom) / 100,
          alignedTop: Math.abs(handle.y - block.y) <= 1,
          usableSize: handle.width >= (48 * zoom) / 100 && handle.height >= (28 * zoom) / 100,
        };
      },
      { message: 'Plus/grip must be in the white paper margin, beside the actual active block' }
    )
    .toEqual({
      insidePaper: true,
      besideTarget: true,
      alignedTop: true,
      usableSize: true,
    });
}
async function hoverBlock(page: Page, target: Locator) {
  // Raw pointer input must wait for Radix's modal exit to restore body hit testing.
  await expect(page.locator('body')).not.toHaveCSS('pointer-events', 'none');
  // Scroll the canvas vertically without auto-centering an oversized A4 page horizontally.
  await target.evaluate((element) => {
    const canvas = element.closest('.sap-canvas');
    if (!(canvas instanceof HTMLElement)) throw Error('Missing canvas');
    canvas.scrollLeft = 0;
    canvas.scrollTop +=
      element.getBoundingClientRect().top -
      canvas.getBoundingClientRect().top -
      canvas.clientHeight * 0.4;
  });
  // Hover actual content, including table text rather than a scroll-wrapper gap.
  const point = await target.evaluate((element) => {
    const text = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
    if (!text) throw Error('Expected real block text');
    const range = document.createRange();
    range.selectNodeContents(text);
    const r = range.getBoundingClientRect();
    return { x: r.x + Math.min(30, r.width / 2), y: r.y + Math.min(10, r.height / 2) };
  });
  await expect
    .poll(
      () =>
        target.evaluate(
          (element, point) => element.contains(document.elementFromPoint(point.x, point.y)),
          point
        ),
      { message: 'The intended block, not an exiting modal layer, receives real pointer input' }
    )
    .toBe(true);
  await page.mouse.move(point.x, point.y, { steps: 3 });
  await expect(page.locator('.richtext-block-handle')).toHaveCSS('visibility', 'visible');
}

for (const width of [1440, 700, 390])
  for (const language of ['English', 'Chinese'])
    for (const theme of ['light', 'dark']) {
      test(`built Playground styles: ${width}px ${language} ${theme} horizontal bubble, tokens and real formatting`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto('./');
        await page.getByRole('button', { name: language, exact: true }).click();
        await page.getByRole('button', { name: `Theme ${theme}`, exact: true }).click();
        const settings = page.getByRole('region', { name: 'Playground settings' });
        const languageControl = settings.getByRole('button', { name: language, exact: true });
        await expect(languageControl).toHaveCSS('border-top-width', '1px');
        expect((await box(languageControl)).height).toBeGreaterThanOrEqual(28);
        const token = await page
          .locator('.reactjs-tiptap-editor')
          .evaluate((el) => getComputedStyle(el).getPropertyValue('--background'));
        expect(token.trim()).not.toBe('');
        expect(
          await page
            .locator('main[data-richtext-portal]')
            .evaluate((el) => getComputedStyle(el).getPropertyValue('--background'))
        ).toBe(token);
        const radius = settings.getByRole('slider', { name: 'Border radius' });
        const slider = radius.locator('..').locator('..');
        expect((await box(slider)).width).toBeCloseTo(192, 0);
        await expect(settings.getByText('Border radius', { exact: true })).toHaveCSS(
          'white-space',
          'nowrap'
        );
        await page.waitForFunction(() => window.editor?.isInitialized);
        await page.evaluate(() => {
          if (!window.editor) throw Error('Editor not ready');
          window.editor.commands.setContent(
            '<h2>Visual review</h2><p>Geometry and formatting across wrapped lines</p>'
          );
        });
        const paragraph = page.locator('.ProseMirror > p');
        await paragraph.click();
        const selectedText = await paragraph.innerText();
        // Home/End select a visual line, not a paragraph. CI's font metrics
        // wrap this sample at 390px; use real keyboard character selection.
        await page.keyboard.press('Control+End');
        for (const _character of selectedText) await page.keyboard.press('Shift+ArrowLeft');
        await expect
          .poll(() => page.evaluate(() => window.getSelection()?.toString()))
          .toBe(selectedText);
        const bubble = page.locator('.richtext-selection-bubble');
        const card = bubble.locator('[data-slot=card]');
        await expect(card).toHaveCSS('flex-direction', 'row');
        await expect(card).toHaveCSS('border-top-width', '1px');
        await inViewport(page, card);
        const r = await box(card),
          p = await box(paragraph);
        expect(r.width).toBeGreaterThan(r.height * 2);
        expect(
          r.y >= p.y + p.height + 4 || r.y + r.height <= p.y - 4,
          'Bubble does not cover the selected paragraph'
        ).toBe(true);
        const sameRowCount = await card.getByRole('button').evaluateAll((elements) => {
          const rows = new Map<number, number>();
          for (const el of elements) {
            const y = Math.round(el.getBoundingClientRect().y);
            rows.set(y, (rows.get(y) ?? 0) + 1);
          }
          return Math.max(...rows.values());
        });
        expect(sameRowCount, 'Toolbar is not one-button-per-line').toBeGreaterThanOrEqual(3);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
        ).toBe(true);
        await page.screenshot({
          animations: 'disabled',
          path: `test-results/visual-playground-${width}-${language}-${theme}.png`,
          fullPage: true,
        });
        await card
          .getByRole('button', { name: language === 'Chinese' ? '粗体' : 'Bold', exact: true })
          .click();
        await expect(paragraph.locator('strong')).toHaveText(selectedText);
      });
    }

for (const width of [1440, 700])
  for (const zoom of [75, 85, 100, 125]) {
    test(`built SAP geometry: ${width}px ${zoom}% bottom sections/table, margins, scrolling and hover/menu`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('sap/');
      await page.getByRole('combobox', { name: '文档缩放' }).click();
      await page.getByRole('option', { name: `${zoom}%`, exact: true }).click();
      for (const margin of ['标准 · 20 mm', '窄 · 15 mm']) {
        await page.getByRole('tab', { name: '布局', exact: true }).click();
        await page.getByRole('combobox', { name: '页边距', exact: true }).click();
        await page.getByRole('option', { name: margin, exact: true }).click();
        for (const target of [
          page.locator('.ProseMirror > h1').last(),
          page.locator('.ProseMirror > .tableWrapper').last(),
        ]) {
          await hoverBlock(page, target);
          await paperHandle(page, target, zoom);
          const grip = page.getByRole('button', { name: '块操作（按住拖拽）', exact: true });
          const r = await box(grip);
          await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2, { steps: 12 });
          await expect(grip).toBeVisible();
          await paperHandle(page, target, zoom);
          await grip.click();
          await expect(page.getByRole('menuitem', { name: '重复块', exact: true })).toBeVisible();
          await inViewport(page, page.locator('[data-slot=dropdown-menu-content]'));
          await page.keyboard.press('Escape');
          await expect(grip).toBeFocused();
          // No new mouse hover: the same reference must follow its scrolling container.
          await page.locator('.sap-canvas').evaluate((el) => {
            el.scrollTop += 36;
            el.scrollLeft = 20;
          });
          await paperHandle(page, target, zoom);
        }
      }
      const bottom = page.locator('.ProseMirror > h1').last();
      await hoverBlock(page, bottom);
      await paperHandle(page, bottom, zoom);
      await page.screenshot({
        animations: 'disabled',
        path: `test-results/visual-sap-bottom-${width}-${zoom}.png`,
      });
      if (width === 1440) {
        await page.getByRole('button', { name: '隐藏方案助手', exact: true }).click();
        await paperHandle(page, bottom, zoom);
        await page.getByRole('button', { name: '隐藏章节目录', exact: true }).click();
        await paperHandle(page, bottom, zoom);
        await page.setViewportSize({ width: 1100, height: 900 });
        await paperHandle(page, bottom, zoom);
      }
      await page.emulateMedia({ media: 'print' });
      await expect(page.locator('[data-block-handle]')).toBeHidden();
    });
  }

test('SAP fixed bubble and slash follow the nested canvas scrollport at 125% with paper-contained block controls', async ({
  page,
}) => {
  await page.goto('sap/');
  await page.getByRole('combobox', { name: '文档缩放' }).click();
  await page.getByRole('option', { name: '125%', exact: true }).click();
  const paragraph = page.locator('.ProseMirror > p').last();
  await hoverBlock(page, paragraph);
  await paperHandle(page, paragraph, 125);
  await paragraph.click();
  await page.keyboard.press('Home');
  await page.keyboard.press('Shift+End');
  const bubble = page.getByRole('toolbar', { name: '文本浮动工具栏' });
  await expect(bubble).toBeVisible();
  await inViewport(page, bubble);
  const before = await box(bubble);
  await page.locator('.sap-canvas').evaluate((el) => {
    el.scrollTop -= 80;
  });
  await expect.poll(async () => (await box(bubble)).y - before.y).toBeCloseTo(80, 0);
  await page.screenshot({
    animations: 'disabled',
    path: 'test-results/visual-sap-scrolled-bubble.png',
  });
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.keyboard.type('/estimand');
  const command = page.getByRole('button', { name: '估计目标框架', exact: true });
  await expect(command).toBeVisible();
  const popup = page.locator('.richtext-suggestion-positioner');
  await inViewport(page, popup);
  const popupBefore = await box(popup);
  await page.locator('.sap-canvas').evaluate((el) => {
    el.scrollTop -= 40;
  });
  await expect.poll(async () => (await box(popup)).y - popupBefore.y).toBeCloseTo(40, 0);
  await page.screenshot({
    animations: 'disabled',
    path: 'test-results/visual-sap-scrolled-slash.png',
  });
  await page.keyboard.press('Enter');
  await expect(page.locator('.ProseMirror')).not.toContainText('/estimand');
});

test('Playground initial TOC has real headings and layout, code/details remain bounded', async ({
  page,
}) => {
  await page.goto('./');
  const toc = page.locator('.ProseMirror [data-type=table-of-contents]');
  await expect(toc).toHaveCount(1);
  await expect(toc).toContainText('Write and organize');
  await expect(toc).toContainText('Code and rich content');
  await expect(page.locator('.ProseMirror pre')).toBeVisible();
  const firstTocLink = toc.getByRole('button').first();
  await expect(firstTocLink).toHaveCSS('justify-content', /^(flex-start|start|flow-start)$/);
  const [linkBox, labelBox] = await Promise.all([
    box(firstTocLink),
    box(firstTocLink.locator('.table-of-contents__index')),
  ]);
  expect(labelBox.x - linkBox.x).toBeLessThanOrEqual(10);
  await page.screenshot({
    animations: 'disabled',
    path: 'test-results/visual-playground-default.png',
    fullPage: true,
  });
});

for (const width of [1440, 390])
  for (const theme of ['light', 'dark']) {
    test(`built plugin surfaces: ${width}px ${theme} menus, popovers, upload/drawing dialogs, table/code bubbles`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('./');
      await page.getByRole('button', { name: `Theme ${theme}`, exact: true }).click();
      await page.waitForFunction(() => window.editor?.isInitialized);
      await page.evaluate(() => window.editor?.commands.setContent('<p>Surface review</p>'));
      const toolbar = page.getByRole('toolbar', { name: 'Editor formatting', exact: true });
      await toolbar.getByRole('button', { name: 'Headings', exact: true }).click();
      const menu = page.locator('[data-slot=dropdown-menu-content]');
      await inViewport(page, menu);
      await expect(menu).toHaveCSS('border-top-width', '1px');
      expect((await box(menu.getByRole('menuitemcheckbox').first())).height).toBeGreaterThanOrEqual(
        24
      );
      await page.screenshot({
        animations: 'disabled',
        path: `test-results/visual-plugins-${width}-${theme}-menu.png`,
      });
      await page.keyboard.press('Escape');
      for (const name of ['Search and Replace', 'Color', 'Emoji', 'Table']) {
        await toolbar.getByRole('button', { name, exact: true }).click();
        const popup = page.locator('[data-slot=popover-content][data-state=open]');
        await expect(popup).toBeVisible();
        if (name === 'Color')
          await expect(popup.locator('[aria-label="Color palette"]')).toBeVisible();
        if (name === 'Emoji')
          await expect(popup.locator('[data-slot=emoji-picker-emoji]:visible').first()).toBeVisible(
            {
              timeout: 20000,
            }
          );
        if (name === 'Table')
          await expect(popup.getByRole('checkbox', { name: 'Header row' })).toBeVisible();
        if (name === 'Emoji')
          await expect(popup.locator('[data-slot=emoji-picker-footer]')).not.toHaveCSS(
            'max-width',
            'none'
          );
        await inViewport(page, popup);
        await expect(popup).toHaveCSS('border-top-width', '1px');
        await expect(popup).toHaveCSS('opacity', '1');
        await expect(popup).toHaveClass(theme === 'dark' ? /\bdark\b/ : /^(?!.*\bdark\b)/);
        expect(await popup.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(
          'rgba(0, 0, 0, 0)'
        );
        await expect.poll(async () => (await box(popup)).width).toBeGreaterThan(150);
        await page.screenshot({
          animations: 'disabled',
          path: `test-results/visual-plugins-${width}-${theme}-${name.replaceAll(' ', '-')}.png`,
        });
        await page.keyboard.press('Escape');
      }
      for (const name of ['Image', 'Drawer']) {
        await toolbar.getByRole('button', { name, exact: true }).click();
        const dialog = page.getByRole('dialog', {
          name: name === 'Image' ? 'Add an image' : 'Drawer',
          exact: true,
        });
        await expect(dialog).toBeVisible();
        if (name === 'Image') {
          await expect(dialog.getByRole('tab', { name: 'Url', exact: true })).toBeVisible();
          const input = dialog.getByRole('textbox').first();
          const expectedBorder = await input.evaluate((el) => {
            el.setAttribute('aria-invalid', 'true');
            const probe = document.createElement('span');
            probe.style.color = el.closest('.dark')
              ? 'hsl(var(--destructive))'
              : 'hsl(var(--destructive) / .6)';
            el.parentElement?.appendChild(probe);
            const color = getComputedStyle(probe).color;
            probe.remove();
            return color;
          });
          await expect(input).toHaveCSS('border-top-color', expectedBorder);
        }
        if (name === 'Drawer') {
          await expect(dialog.getByRole('button', { name: 'Pencil', exact: true })).toBeVisible();
          await expect(dialog.locator('canvas').first()).toBeVisible();
        }
        await inViewport(page, dialog);
        const buttons = dialog.getByRole('button');
        expect(await buttons.count()).toBeGreaterThan(1);
        await page.screenshot({
          animations: 'disabled',
          path: `test-results/visual-plugins-${width}-${theme}-${name}.png`,
        });
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
      }
      await page.evaluate(() =>
        window.editor?.commands.setContent(
          '<pre><code class="language-js">const count = 1;</code></pre>'
        )
      );
      await page.locator('.ProseMirror pre code').click();
      const codeBubble = page.locator('.richtext-bubble-surface:visible');
      await expect(codeBubble).toHaveCSS('flex-direction', 'row');
      await inViewport(page, codeBubble);
      const codeRect = await box(codeBubble);
      expect(codeRect.width).toBeGreaterThan(codeRect.height * 2);
      await page.screenshot({
        animations: 'disabled',
        path: `test-results/visual-plugins-${width}-${theme}-code-bubble.png`,
      });
      await page.evaluate(() =>
        window.editor?.commands.setContent(
          '<table><tbody><tr><td><p>Cell A</p></td><td><p>Cell B</p></td></tr></tbody></table>'
        )
      );
      await page.locator('.ProseMirror td p').first().click();
      const tableBubble = page.locator('.richtext-bubble-surface:visible');
      await expect(tableBubble).toHaveCSS('flex-direction', 'row');
      await inViewport(page, tableBubble);
      const tableRect = await box(tableBubble);
      expect(tableRect.width).toBeGreaterThan(tableRect.height * 2);
      await page.screenshot({
        animations: 'disabled',
        path: `test-results/visual-plugins-${width}-${theme}-table-bubble.png`,
      });
    });
  }
