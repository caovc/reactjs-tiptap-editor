import { expect, test, type Page } from '@playwright/test';

const observedErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  observedErrors.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().startsWith(new URL(page.url()).origin))
      errors.push(`${response.status()} ${response.url()}`);
  });
});
test.afterEach(async ({ page }) => {
  expect(observedErrors.get(page), 'No runtime/console/first-party resource errors').toEqual([]);
});

async function openSap(page: Page) {
  await page.goto('sap/');
  await expect(page.getByRole('textbox', { name: 'SAP 文档正文' })).toBeVisible();
  await expect(page.getByText('已保存到本机', { exact: true })).toBeVisible();
}

test('SAP: production document and accessible desktop/mobile visual evidence', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().startsWith(new URL(page.url()).origin))
      errors.push(`${response.status()} ${response.url()}`);
  });
  await openSap(page);
  await expect(page.getByRole('navigation', { name: '文档目录' }).getByRole('button')).toHaveCount(
    15
  );
  await expect(page.locator('.tiptap h1').first()).toHaveAttribute('data-section-number', '1');
  await page.screenshot({ path: 'test-results/sap-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'SAP 文档正文' })).toBeVisible();
  await expect(page.getByText('已保存到本机', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/sap-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  expect(errors).toEqual([]);
});

const body = (page: Page) => page.getByRole('textbox', { name: 'SAP 文档正文' });
async function append(page: Page, text: string) {
  await page.locator('.tiptap > p').last().scrollIntoViewIfNeeded();
  await body(page).evaluate((element) => {
    if (!(element instanceof HTMLElement)) throw new Error('No editor');
    element.focus({ preventScroll: true });
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
  });
  await expect
    .poll(() =>
      body(page).evaluate((element) => {
        const selection = window.getSelection();
        if (!selection?.focusNode) return 'no selection';
        const remaining = document.createRange();
        remaining.selectNodeContents(element);
        remaining.setStart(selection.focusNode, selection.focusOffset);
        return remaining.toString();
      })
    )
    .toBe('');
  await page.keyboard.press('Enter');
  await page.keyboard.insertText(text);
  await expect(body(page)).toContainText(text);
}
async function selectText(page: Page, text: string) {
  await page.locator('.tiptap').getByText(text, { exact: false }).last().scrollIntoViewIfNeeded();
  await page.evaluate((text) => {
    const root = document.querySelector('.tiptap');
    if (!(root instanceof HTMLElement)) throw new Error('No editor');
    root.focus({ preventScroll: true });
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const index = node.textContent?.indexOf(text) ?? -1;
      if (index >= 0) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + text.length);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.dispatchEvent(new Event('selectionchange'));
        return;
      }
    }
    throw new Error(`Text not found: ${text}`);
  }, text);
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString())).toBe(text);
}
async function choose(page: Page, label: string, option: string) {
  await page.getByRole('combobox', { name: label, exact: true }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}
async function importFile(page: Page, name: string, text: string) {
  await page.getByLabel('导入 SAP 文件').setInputFiles({
    name,
    mimeType: name.endsWith('.json') ? 'application/json' : 'text/html',
    buffer: Buffer.from(text),
  });
}

test('SAP: editing formats, fonts, live numbered outline and cursor-preserving navigation', async ({
  page,
}) => {
  await openSap(page);
  await append(page, '格式回归文字');
  await selectText(page, '格式回归文字');
  await page.getByRole('button', { name: '粗体', exact: true }).click();
  await expect(page.locator('.tiptap strong')).toContainText('格式回归文字');
  await choose(page, '字体', 'Arial');
  await choose(page, '字号', '18');
  await expect(page.locator('.tiptap span[style*="font-size: 18px"]')).toContainText(
    '格式回归文字'
  );
  await page.getByRole('button', { name: '字体颜色', exact: true }).click();
  await page.getByRole('menuitem', { name: '深蓝', exact: true }).click();
  await expect(page.locator('.tiptap span[style*="color"]')).toContainText('格式回归文字');
  await choose(page, '段落样式', '标题 2');
  const heading = page.locator('.tiptap h2').filter({ hasText: '格式回归文字' });
  await expect(heading).toHaveAttribute('data-section-number', '12.1');
  await selectText(page, '格式回归文字');
  await page.keyboard.insertText('更新统计章节');
  const nav = page.getByRole('navigation', { name: '文档目录' });
  await expect(nav.getByRole('button', { name: /更新统计章节/ })).toBeVisible();
  await expect(nav.getByRole('button', { name: /格式回归文字/ })).toHaveCount(0);
  await nav.getByRole('button', { name: /更新统计章节/ }).click();
  await page.keyboard.insertText('导航');
  await expect(page.locator('.tiptap h2').last()).toHaveText('导航更新统计章节');
  await page.getByRole('button', { name: '撤销', exact: true }).click();
  await expect(page.locator('.tiptap h2').last()).toHaveText('更新统计章节');
  await page.getByRole('button', { name: '重做', exact: true }).click();
  await expect(page.locator('.tiptap h2').last()).toHaveText('导航更新统计章节');
});

test('SAP: structured SAP insertion and real table row operations remain undoable', async ({
  page,
}) => {
  await openSap(page);
  const tables = page.locator('.tiptap table');
  const initial = await tables.count();
  await append(page, '插入位置');
  await page.getByRole('button', { name: /估计目标框架/ }).click();
  await expect(tables).toHaveCount(initial + 1);
  await expect(page.locator('.tiptap h2').last()).toHaveText('估计目标框架');
  await expect(tables.last()).toContainText('伴发事件策略');
  await page.getByRole('button', { name: '撤销', exact: true }).click();
  await expect(tables).toHaveCount(initial);
  await body(page).press('Control+End');
  await page.getByRole('tab', { name: '插入', exact: true }).click();
  await page.getByRole('button', { name: '插入 3 × 3 表格', exact: true }).click();
  await expect(tables).toHaveCount(initial + 1);
  await expect(tables.last().locator('tr')).toHaveCount(3);
  await tables.last().locator('td').first().click();
  await page.getByRole('button', { name: '表格下方加行', exact: true }).click();
  await expect(tables.last().locator('tr')).toHaveCount(4);
  await page.getByRole('button', { name: '删除当前行', exact: true }).click();
  await expect(tables.last().locator('tr')).toHaveCount(3);
  await expect(page.getByText('已保存到本机', { exact: true })).toBeVisible();
});

test('SAP: metadata, editable glossary, stable section IDs and document survive refresh', async ({
  page,
}) => {
  await openSap(page);
  const id = await page.locator('.tiptap h1').first().getAttribute('data-sap-id');
  await page.getByRole('textbox', { name: '方案编号', exact: true }).fill('DEMO-LOCAL-301');
  await page.getByRole('textbox', { name: '文档标题', exact: true }).fill('本地恢复验证计划');
  await append(page, '刷新恢复标记');
  await page.getByRole('button', { name: /术语和缩略语/ }).click();
  await page.getByRole('button', { name: '新增术语', exact: true }).click();
  await page.getByRole('textbox', { name: '缩略语 8', exact: true }).fill('QC');
  await page.getByRole('textbox', { name: '术语定义 8', exact: true }).fill('质量核验（虚构示例）');
  await page.getByRole('button', { name: '插入术语表', exact: true }).click();
  await expect(page.locator('.tiptap table').last()).toContainText('质量核验');
  await expect(page.getByText('已保存到本机', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('textbox', { name: '方案编号', exact: true })).toHaveValue(
    'DEMO-LOCAL-301'
  );
  await expect(page.locator('.sap-cover h1')).toHaveText('本地恢复验证计划');
  await expect(body(page)).toContainText('刷新恢复标记');
  await expect(page.locator('.tiptap h1').first()).toHaveAttribute('data-sap-id', id || 'missing');
  await page.getByRole('button', { name: /术语和缩略语/ }).click();
  await expect(page.getByRole('textbox', { name: '缩略语 8', exact: true })).toHaveValue('QC');
});

test('SAP: anchored local comments resolve, persist, navigate and report deleted anchors', async ({
  page,
}) => {
  await openSap(page);
  await append(page, '锚定批注测试文字');
  await selectText(page, '锚定批注测试文字');
  await page.getByRole('tab', { name: '审阅', exact: true }).click();
  await page.getByRole('button', { name: '新建批注', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('锚定批注测试文字');
  await page
    .getByRole('textbox', { name: '批注内容', exact: true })
    .fill('请核对终点的分析窗定义。');
  await page.getByRole('button', { name: '保存批注', exact: true }).click();
  await expect(page.locator('.sap-comment')).toHaveText('锚定批注测试文字');
  await expect(page.getByRole('textbox', { name: '编辑批注 1', exact: true })).toHaveValue(
    '请核对终点的分析窗定义。'
  );
  await selectText(page, '锚定批注测试文字');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.insertText('前置编辑');
  await expect(page.locator('.sap-comment')).toHaveText('锚定批注测试文字');
  await page.getByRole('button', { name: '标记处理', exact: true }).click();
  await expect(page.getByText('批注 1 · 已处理', { exact: true })).toBeVisible();
  await expect(page.getByText('已保存到本机', { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('tab', { name: /批注/ }).click();
  await expect(page.getByText('批注 1 · 已处理', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /“锚定批注测试文字”/ }).click();
  await expect
    .poll(() => page.evaluate(() => window.getSelection()?.toString()))
    .toBe('锚定批注测试文字');
  await page.screenshot({ path: 'test-results/sap-review.png', fullPage: true });
  await page.keyboard.press('Backspace');
  await expect(
    page.getByRole('button', { name: '锚点已删除 · 不再定位', exact: true })
  ).toBeDisabled();
  await page.getByRole('tab', { name: '检查', exact: true }).click();
  await expect(page.getByRole('button', { name: /批注锚点已删除/ })).toBeVisible();
  await page.getByRole('tab', { name: '开始', exact: true }).click();
  await page.getByRole('button', { name: '撤销', exact: true }).click();
  await expect(page.locator('.sap-comment')).toHaveText('锚定批注测试文字');
  await page.getByRole('tab', { name: /批注/ }).click();
  await page.getByRole('button', { name: '重新打开', exact: true }).click();
  await expect(page.getByText('批注 1 · 待处理', { exact: true })).toBeVisible();
});

test('SAP: literal search/replace is safe text, can jump and undo', async ({ page }) => {
  await openSap(page);
  await append(page, '检索标记 + 检索标记');
  await page.keyboard.press('Control+f');
  await page.getByRole('textbox', { name: '查找文本', exact: true }).fill('检索标记');
  await expect(page.getByText('找到 2 处匹配', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '下一处', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString())).toBe('检索标记');
  await page
    .getByRole('textbox', { name: '替换为', exact: true })
    .fill('<script>字面替换</script>');
  await page.getByRole('button', { name: '全部替换', exact: true }).click();
  await expect(body(page)).toContainText('<script>字面替换</script> + <script>字面替换</script>');
  await expect(page.locator('.tiptap script')).toHaveCount(0);
  await expect(page.getByText('找到 0 处匹配', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '撤销', exact: true }).click();
  await expect(body(page)).toContainText('检索标记 + 检索标记');
});

test('SAP: JSON/HTML export, validated roundtrip and invalid import leave content safe', async ({
  page,
}) => {
  const fs = await import('node:fs/promises');
  await openSap(page);
  await page.getByRole('textbox', { name: '方案编号', exact: true }).fill('ROUNDTRIP-204');
  await page.getByRole('button', { name: '导出', exact: true }).click();
  const pending = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: '完整文档 JSON', exact: true }).click();
  const file = await pending;
  const path = await file.path();
  if (!path) throw new Error('No JSON download');
  const text = await fs.readFile(path, 'utf8');
  expect(text).toContain('ROUNDTRIP-204');
  expect(text).toContain('sapId');
  expect(text).toContain('terms');
  await page.getByRole('textbox', { name: '方案编号', exact: true }).fill('CHANGED');
  await importFile(page, 'roundtrip.json', text);
  await expect(page.getByRole('dialog')).toContainText('roundtrip.json');
  await page.getByRole('button', { name: '取消', exact: true }).click();
  await expect(page.getByRole('textbox', { name: '方案编号', exact: true })).toHaveValue('CHANGED');
  await importFile(page, 'roundtrip.json', text);
  await page.getByRole('button', { name: '确认替换', exact: true }).click();
  await expect(page.getByRole('textbox', { name: '方案编号', exact: true })).toHaveValue(
    'ROUNDTRIP-204'
  );
  await expect(page.getByRole('button', { name: '撤销', exact: true })).toBeDisabled();
  const old = await body(page).textContent();
  await importFile(page, 'invalid.json', '{"version":1,"doc":{"type":"script","content":[]}}');
  await expect(page.getByText(/导入失败，当前文档未更改/)).toBeVisible();
  await expect(body(page)).toHaveText(old || '');
  await page.getByRole('button', { name: '导出', exact: true }).click();
  const htmlPending = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: '正文 HTML', exact: true }).click();
  const htmlFile = await htmlPending;
  const htmlPath = await htmlFile.path();
  if (!htmlPath) throw new Error('No HTML download');
  const html = await fs.readFile(htmlPath, 'utf8');
  expect(html).toContain('<!doctype html>');
  expect(html).toContain('data-section-number');
  expect(html).toContain('<table');
  await importFile(page, 'body.html', html);
  await page.getByRole('button', { name: '确认替换', exact: true }).click();
  await expect(body(page)).toContainText('主要终点分析');
  await expect(page.getByText('已保存到本机', { exact: true })).toBeVisible();
});

test('SAP: HTML sanitization blocks scripts/resources and schema rejects unsafe CSS and broken tables', async ({
  page,
}) => {
  await openSap(page);
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('sap-injection.invalid')) requests.push(request.url());
  });
  await importFile(
    page,
    'xss.html',
    '<h1>安全导入</h1><script>window.__sapInjected=1</script><img src="https://sap-injection.invalid/a" onerror="window.__sapInjected=2"><p onclick="window.__sapInjected=3" style="background-image:url(https://sap-injection.invalid/style);color:#24559a">保留正文</p><iframe src="https://sap-injection.invalid/b"></iframe><a href="javascript:alert(1)">安全文本</a>'
  );
  await page.getByRole('button', { name: '确认替换', exact: true }).click();
  await expect(body(page)).toContainText('安全导入');
  await expect(page.locator('.tiptap script,.tiptap img,.tiptap iframe,.tiptap a')).toHaveCount(0);
  expect(await page.evaluate(() => '__sapInjected' in window)).toBe(false);
  expect(requests).toEqual([]);
  const valid = {
    version: 1,
    meta: { title: '测试', protocol: 'DEMO', version: '1', sponsor: '虚构', date: '2026-11-20' },
    terms: [],
    comments: [],
    margin: 'normal',
  };
  await importFile(
    page,
    'unsafe.json',
    JSON.stringify({
      ...valid,
      doc: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '非法样式',
                marks: [
                  {
                    type: 'textStyle',
                    attrs: { fontFamily: 'x;background:url(https://sap-injection.invalid/c)' },
                  },
                ],
              },
            ],
          },
        ],
      },
    })
  );
  await expect(page.getByText(/导入失败，当前文档未更改/)).toBeVisible();
  await expect(body(page)).toContainText('安全导入');
  await importFile(
    page,
    'broken.json',
    JSON.stringify({
      ...valid,
      doc: {
        type: 'doc',
        content: [
          {
            type: 'table',
            content: [
              {
                type: 'tableRow',
                content: [{ type: 'tableCell', content: [{ type: 'paragraph' }] }],
              },
              {
                type: 'tableRow',
                content: [
                  { type: 'tableCell', content: [{ type: 'paragraph' }] },
                  { type: 'tableCell', content: [{ type: 'paragraph' }] },
                ],
              },
            ],
          },
        ],
      },
    })
  );
  await expect(page.getByText(/表格行列结构不完整/)).toBeVisible();
  await expect(body(page)).toContainText('安全导入');
});

test('SAP: structural checks jump to placeholders and update after editing; reset confirms', async ({
  page,
}) => {
  await openSap(page);
  await page.getByRole('tab', { name: '检查', exact: true }).click();
  await expect(page.getByText('1 项待核对', { exact: true })).toBeVisible();
  await expect(page.getByText(/不验证统计方法、计算/)).toBeVisible();
  await page.getByRole('button', { name: /待完善：插补模型/ }).click();
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.getAttribute('aria-label')))
    .toBe('SAP 文档正文');
  await selectText(page, '【待确认：分析窗定义】');
  await page.keyboard.insertText('分析窗规则已补充（演示）');
  await expect(page.getByText('未发现预设结构问题', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '文件', exact: true }).click();
  await page.getByRole('menuitem', { name: '重置演示模板', exact: true }).click();
  await page.getByRole('button', { name: '取消', exact: true }).click();
  await expect(body(page)).toContainText('分析窗规则已补充（演示）');
  await page.getByRole('button', { name: '文件', exact: true }).click();
  await page.getByRole('menuitem', { name: '重置演示模板', exact: true }).click();
  await page.getByRole('button', { name: '确认替换', exact: true }).click();
  await expect(body(page)).toContainText('【待确认：分析窗定义】');
});

test('SAP: zoom, real A4 margins and print output omit editor chrome', async ({ page }) => {
  await openSap(page);
  await choose(page, '文档缩放', '100%');
  expect(
    await page.locator('.sap-paper-wrap').evaluate((element) => getComputedStyle(element).zoom)
  ).toBe('1');
  await page.getByRole('tab', { name: '布局', exact: true }).click();
  await choose(page, '页边距', '窄 · 15 mm');
  const padding = await page
    .locator('.sap-paper')
    .evaluate((element) => parseFloat(getComputedStyle(element).paddingLeft));
  expect(padding).toBeCloseTo((15 * 96) / 25.4, 0);
  await choose(page, '文档缩放', '65%');
  expect(
    await page.locator('.sap-paper-wrap').evaluate((element) => getComputedStyle(element).zoom)
  ).toBe('0.65');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.sap-titlebar')).toBeHidden();
  await expect(page.locator('.sap-assistant')).toBeHidden();
  expect(
    await page.locator('.sap-paper-wrap').evaluate((element) => getComputedStyle(element).zoom)
  ).toBe('1');
  expect(
    await page.locator('.sap-paper').evaluate((element) => getComputedStyle(element).paddingLeft)
  ).toBe('0px');
  expect(
    await page
      .locator('.reactjs-tiptap-editor')
      .evaluate((element) => getComputedStyle(element).borderLeftWidth)
  ).toBe('0px');
  const pdf = await page.pdf({
    path: 'test-results/sap-print.pdf',
    preferCSSPageSize: true,
    printBackground: true,
  });
  expect(pdf.length).toBeGreaterThan(10000);
});

test('SAP: corrupt local draft is never silently overwritten', async ({ page }) => {
  await openSap(page);
  await page.evaluate(() => localStorage.setItem('reui-sap-studio:v1', '{broken-local-draft'));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('原草稿未覆盖');
  await expect(page.getByText('自动保存已暂停', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('reui-sap-studio:v1'))).toBe(
    '{broken-local-draft'
  );
  await expect(body(page)).toContainText('研究概述');
});

test('SAP: a second tab pauses autosave instead of overwriting unseen changes', async ({
  page,
  context,
}) => {
  await openSap(page);
  const other = await context.newPage();
  await openSap(other);
  await other.getByRole('textbox', { name: '方案编号', exact: true }).fill('OTHER-TAB-204');
  await expect(other.getByText('已保存到本机', { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('另一标签页已修改本地草稿');
  await expect(page.getByText('自动保存已暂停', { exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: '方案编号', exact: true }).fill('UNSAVED-LOCAL');
  expect(await page.evaluate(() => localStorage.getItem('reui-sap-studio:v1'))).toContain(
    'OTHER-TAB-204'
  );
});

test('SAP: narrow screen can open outline, navigate and edit metadata without body overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openSap(page);
  await expect(page.getByRole('complementary', { name: '章节导航' })).toHaveCount(0);
  await page.getByRole('button', { name: '显示章节目录', exact: true }).click();
  await page
    .getByRole('navigation', { name: '文档目录' })
    .getByRole('button', { name: /主要终点分析/ })
    .click();
  await page.getByRole('button', { name: '关闭章节目录', exact: true }).click();
  await page.getByRole('button', { name: '显示方案助手', exact: true }).click();
  await page.getByRole('textbox', { name: '方案编号', exact: true }).fill('MOBILE-204');
  await page.screenshot({ path: 'test-results/sap-mobile-assistant.png', fullPage: true });
  await page.getByRole('button', { name: '隐藏方案助手', exact: true }).click();
  await choose(page, '文档缩放', '50%');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  await expect(page.getByText('已保存到本机', { exact: true })).toBeVisible();
});
