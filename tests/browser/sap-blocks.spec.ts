import { expect, test, type Page } from "@playwright/test";

let errors: string[];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("sap/");
  await expect(
    page.getByRole("textbox", { name: "SAP 文档正文" }),
  ).toBeVisible();
  await expect(page.getByText("已保存到本机", { exact: true })).toBeVisible();
});
test.afterEach(() => expect(errors).toEqual([]));
const editor = (page: Page) =>
  page.getByRole("textbox", { name: "SAP 文档正文" });
async function end(page: Page) {
  await page.locator(".tiptap > p").last().scrollIntoViewIfNeeded();
  await editor(page).evaluate((element) => {
    element.focus({ preventScroll: true });
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.dispatchEvent(new Event("selectionchange"));
  });
  await page.keyboard.press("Enter");
}
async function append(page: Page, text: string) {
  await end(page);
  await page.keyboard.insertText(text);
}
async function menu(page: Page, text: string) {
  await editor(page).getByText(text, { exact: true }).hover();
  const grip = page.getByRole("button", {
    name: "块操作（按住拖拽）",
    exact: true,
  });
  await expect(grip).toBeVisible();
  await grip.click();
}
async function chooseZoom(page: Page, label: string) {
  await page.getByRole("combobox", { name: "文档缩放" }).click();
  await page.getByRole("option", { name: label, exact: true }).click();
}

test("SAP blocks: slash filtering/keyboard inserts headings and structured SAP blocks; reload keeps structure", async ({
  page,
}) => {
  await end(page);
  await page.keyboard.type("/h");
  await expect(
    page.getByRole("button", { name: "标题 1", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.keyboard.insertText("BLOCK-HEADING");
  await expect(editor(page).locator("h2")).toContainText(["BLOCK-HEADING"]);
  await expect(
    page.getByRole("navigation", { name: "文档目录" }),
  ).toContainText("BLOCK-HEADING");
  const tables = await editor(page).locator("table").count();
  await end(page);
  await page.keyboard.type("/estimand");
  await expect(
    page.getByRole("button", { name: "估计目标框架", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(editor(page).locator("table")).toHaveCount(tables + 1);
  await expect(editor(page)).not.toContainText("/estimand");
  await expect(page.getByText("已保存到本机", { exact: true })).toBeVisible();
  await page.reload();
  await expect(editor(page).locator("table")).toHaveCount(tables + 1);
  await expect(editor(page)).toContainText("BLOCK-HEADING");
});

test("SAP blocks: block moving is atomic/undoable, conversion, insertion, duplicate and delete work", async ({
  page,
}) => {
  await append(page, "BLOCK-A");
  await page.keyboard.press("Enter");
  await page.keyboard.insertText("BLOCK-B");
  await menu(page, "BLOCK-A");
  await page.getByRole("menuitem", { name: "下移块", exact: true }).click();
  await expect
    .poll(() => editor(page).innerText())
    .toMatch(/BLOCK-B[\s\S]*BLOCK-A/);
  await page.getByRole("button", { name: "撤销", exact: true }).click();
  await expect
    .poll(() => editor(page).innerText())
    .toMatch(/BLOCK-A[\s\S]*BLOCK-B/);
  await menu(page, "BLOCK-A");
  await page
    .getByRole("menuitem", { name: "转换为二级标题", exact: true })
    .click();
  await expect(
    editor(page).locator("h2").filter({ hasText: "BLOCK-A" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "文档目录" }),
  ).toContainText("BLOCK-A");
  await menu(page, "BLOCK-A");
  await page.getByRole("menuitem", { name: "重复块", exact: true }).click();
  await expect(editor(page).getByText("BLOCK-A", { exact: true })).toHaveCount(
    2,
  );
  await editor(page).getByText("BLOCK-A", { exact: true }).last().hover();
  await page
    .getByRole("button", { name: "块操作（按住拖拽）", exact: true })
    .click();
  await page.getByRole("menuitem", { name: "删除块", exact: true }).click();
  await expect(editor(page).getByText("BLOCK-A", { exact: true })).toHaveCount(
    1,
  );
  await menu(page, "BLOCK-B");
  await page.getByRole("menuitem", { name: "在块前插入", exact: true }).click();
  await page.keyboard.insertText("INSERTED-BLOCK");
  await expect(editor(page)).toContainText("INSERTED-BLOCK");
});

for (const zoom of [75, 100, 125]) {
  test(`SAP blocks: real drag/drop reorders content at ${zoom}% zoom and undo restores it`, async ({
    page,
  }) => {
    await chooseZoom(page, `${zoom}%`);
    await append(page, "DRAG-A");
    await page.keyboard.press("Enter");
    await page.keyboard.insertText("DRAG-B");
    await page.keyboard.press("Enter");
    await page.keyboard.insertText("DRAG-C");
    await page.keyboard.press("Enter");
    const a = editor(page).getByText("DRAG-A", { exact: true });
    const c = editor(page).locator(":scope > p").last();
    await a.hover();
    const grip = page.locator("[data-block-handle]").locator("..");
    await expect(grip).toHaveAttribute("draggable", "true");
    const box = await c.boundingBox();
    if (!box) throw Error("No drop target");
    await page
      .getByRole("button", { name: "块操作（按住拖拽）", exact: true })
      .dragTo(c, { targetPosition: { x: 30, y: box.height - 1 } });
    await expect
      .poll(() => editor(page).innerText())
      .toMatch(/DRAG-B[\s\S]*DRAG-C[\s\S]*DRAG-A/);
    await page.getByRole("button", { name: "撤销", exact: true }).click();
    await expect
      .poll(() => editor(page).innerText())
      .toMatch(/DRAG-A[\s\S]*DRAG-B[\s\S]*DRAG-C/);
  });
}

test("SAP blocks: scaled hover/menu and selection bubble remain usable on a narrow screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 700, height: 900 });
  await expect(
    page.getByRole("complementary", { name: "章节导航" }),
  ).toHaveCount(0);
  await expect(page.locator(".sap-assistant")).toHaveCount(0);
  await chooseZoom(page, "75%");
  await append(page, "ZOOM-BLOCK");
  await menu(page, "ZOOM-BLOCK");
  await page
    .getByRole("menuitem", { name: "转换为二级标题", exact: true })
    .click();
  const block = editor(page).getByText("ZOOM-BLOCK", { exact: true });
  await block.click();
  await page.keyboard.press("Home");
  await page.keyboard.press("Shift+End");
  const bubble = page.getByRole("toolbar", { name: "文本浮动工具栏" });
  await expect(bubble).toBeInViewport();
  await bubble.getByRole("button", { name: "浮动加粗", exact: true }).click();
  await expect(
    editor(page).locator("h2 strong").filter({ hasText: "ZOOM-BLOCK" }),
  ).toHaveText("ZOOM-BLOCK");
  await page.screenshot({
    path: "test-results/sap-blocks-narrow.png",
    fullPage: true,
  });
  await page.emulateMedia({ media: "print" });
  await expect(bubble).toBeHidden();
  await expect(page.locator("[data-block-handle]")).toBeHidden();
});

test("SAP blocks: reordering preserves heading IDs/comment anchors, duplicate detaches review metadata and reload saves valid structure", async ({
  page,
}) => {
  await append(page, "COMMENT-ANCHOR");
  await page.keyboard.press("Enter");
  await page.keyboard.insertText("COMMENT-NEIGHBOR");
  await menu(page, "COMMENT-ANCHOR");
  await page
    .getByRole("menuitem", { name: "转换为二级标题", exact: true })
    .click();
  const heading = editor(page)
    .locator("h2")
    .filter({ hasText: "COMMENT-ANCHOR" });
  const id = await heading.getAttribute("data-sap-id");
  if (!id) throw Error("Missing section ID");
  await heading.click();
  await page.keyboard.press("Home");
  await page.keyboard.press("Shift+End");
  await page.getByRole("tab", { name: "审阅", exact: true }).click();
  await page.getByRole("button", { name: "新建批注", exact: true }).click();
  await page
    .getByRole("textbox", { name: "批注内容", exact: true })
    .fill("虚构审阅备注：检查锚点保留");
  await page.getByRole("button", { name: "保存批注", exact: true }).click();
  await menu(page, "COMMENT-ANCHOR");
  await page.getByRole("menuitem", { name: "下移块", exact: true }).click();
  await expect
    .poll(() => editor(page).innerText())
    .toMatch(/COMMENT-NEIGHBOR[\s\S]*COMMENT-ANCHOR/);
  await expect(heading).toHaveAttribute("data-sap-id", id);
  await expect(page.locator(".sap-comment")).toHaveText("COMMENT-ANCHOR");
  await menu(page, "COMMENT-ANCHOR");
  await page.getByRole("menuitem", { name: "重复块", exact: true }).click();
  await expect(page.locator(".sap-comment")).toHaveCount(1);
  await expect(
    editor(page).getByText("COMMENT-ANCHOR", { exact: true }),
  ).toHaveCount(2);
  await expect(page.getByText("已保存到本机", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator(".sap-comment")).toHaveText("COMMENT-ANCHOR");
  await expect(
    editor(page).getByText("COMMENT-ANCHOR", { exact: true }),
  ).toHaveCount(2);
  await expect(editor(page).locator(`[data-sap-id="${id}"]`)).toHaveCount(1);
  await page.screenshot({
    path: "test-results/sap-blocks-desktop.png",
    fullPage: true,
  });
});
