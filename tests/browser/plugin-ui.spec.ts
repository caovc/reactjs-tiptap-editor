import { expect, test } from "@playwright/test";

let errors: string[];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("response", (response) => {
    if (
      response.status() >= 400 &&
      response.url().startsWith(new URL(page.url()).origin)
    )
      errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto("./");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByRole("button", { name: "Headings", exact: true }).click();
  await page.getByRole("menuitemcheckbox", { name: /^Heading 2/ }).click();
  await expect(
    page.getByRole("button", { name: "Headings", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Headings", exact: true }).click();
  await page.getByRole("menuitemcheckbox", { name: /^Paragraph/ }).click();
  await expect(
    page.getByRole("button", { name: "Headings", exact: true }),
  ).toBeFocused();
});
test.afterEach(() => expect(errors).toEqual([]));

test("plugins: color swatches and RGB/hex ReUI controls apply marks, validate and reset", async ({
  page,
}) => {
  const editor = page.locator(".ProseMirror");
  await editor.fill("Palette behavior");
  await editor.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Color", exact: true }).click();
  await page
    .getByRole("button", { name: "Color #F5222D", exact: true })
    .click();
  await expect(editor.locator("span[style*=color]")).toHaveCSS(
    "color",
    "rgb(245, 34, 45)",
  );
  await page.getByRole("button", { name: "Color", exact: true }).click();
  await page.getByRole("button", { name: "More Colors…", exact: true }).click();
  const hex = page.getByRole("textbox", { name: "Hex color" });
  await hex.fill("#zzzzzz");
  await expect(
    page.getByRole("button", { name: "Apply custom color" }),
  ).toBeDisabled();
  await hex.fill("#123456");
  const red = page.getByRole("slider", { name: "Red", exact: true });
  await red.focus();
  await red.press("ArrowRight");
  await expect(hex).toHaveValue("#133456");
  await page.screenshot({
    path: "test-results/reui-color-controls.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Apply custom color" }).click();
  await expect(editor.locator("span[style*=color]")).toHaveCSS(
    "color",
    "rgb(19, 52, 86)",
  );
  await page.getByRole("button", { name: "Color", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Color #133456", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Default", exact: true }).click();
  await expect(editor.locator("span[style*=color]")).toHaveCount(0);
});

test("plugins: table grid keyboard insertion honors the header control", async ({
  page,
}) => {
  await page.locator(".ProseMirror").fill("Table keyboard");
  await page.getByRole("button", { name: "Table", exact: true }).click();
  await expect(
    page.getByRole("checkbox", { name: "Header row" }),
  ).toBeChecked();
  const cell = page.getByRole("button", {
    name: "Insert table 2 rows 3 columns",
    exact: true,
  });
  await cell.focus();
  await cell.press("Enter");
  await expect(page.locator(".ProseMirror table tr")).toHaveCount(2);
  await expect(page.locator(".ProseMirror table th")).toHaveCount(3);
  await expect(page.locator(".ProseMirror table td")).toHaveCount(3);
});

test("plugins: mention and short-message suggestions retain keyboard selection and click behavior", async ({
  page,
}) => {
  const editor = page.locator(".ProseMirror");
  await editor.fill("");
  await editor.pressSequentially("@");
  const choices = page
    .locator("[data-richtext-portal] button")
    .filter({ hasText: /[a-zA-Z]/ });
  await expect(choices.first()).toBeVisible();
  await editor.press("ArrowDown");
  await editor.press("Enter");
  await expect(editor.locator("[data-type=mention]")).toHaveCount(1);
  await editor.press("End");
  await editor.press("Enter");
  await editor.press("Shift+Space");
  await editor.pressSequentially("brb");
  const suggestion = page.getByRole("button", { name: /brb Be right back/ });
  await expect(suggestion).toBeVisible();
  await suggestion.click();
  await expect(editor).toContainText("Be right back");
});

test("plugins: real drawing tools, color actions and ReUI sliders operate on the canvas", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Drawer", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Drawer", exact: true });
  await dialog.getByRole("button", { name: "Pencil", exact: true }).click();
  const pen = dialog.getByRole("slider", { name: "Pencil thickness" });
  await pen.focus();
  await pen.press("ArrowRight");
  await expect(pen).toHaveAttribute("aria-valuenow", "2.1");
  await dialog
    .getByRole("button", { name: "Drawing color #007aff", exact: true })
    .click();
  const canvas = dialog.locator("canvas").first();
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  if (!box) throw Error("No canvas bounds");
  await page.mouse.move(box.x + 150, box.y + 180);
  await page.mouse.down();
  await page.mouse.move(box.x + 250, box.y + 230, { steps: 10 });
  await page.mouse.up();
  const drawnPixels = () =>
    canvas.evaluate((element) => {
      const ctx = element.getContext("2d");
      if (!ctx) throw Error("No drawing context");
      const data = ctx.getImageData(0, 0, element.width, element.height).data;
      let count = 0;
      for (let i = 0; i < data.length; i += 4)
        if (
          data[i + 3] > 0 &&
          (data[i] < 240 || data[i + 1] < 240 || data[i + 2] < 240)
        )
          count++;
      return count;
    });
  await expect.poll(drawnPixels).toBeGreaterThan(0);
  const pencilPixels = await drawnPixels();
  await dialog.getByRole("button", { name: "Square", exact: true }).click();
  const border = dialog.getByRole("slider", { name: "Shape border thickness" });
  await border.focus();
  await border.press("ArrowRight");
  await expect(border).toHaveAttribute("aria-valuenow", "1");
  await page.mouse.move(box.x + 300, box.y + 240);
  await page.mouse.down();
  await page.mouse.move(box.x + 390, box.y + 310, { steps: 10 });
  await page.mouse.up();
  await expect.poll(drawnPixels).toBeGreaterThan(pencilPixels);
  await dialog.screenshot({ path: "test-results/reui-drawing-dialog.png" });
  await dialog
    .getByRole("button", { name: "Undo drawing", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Redo drawing", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".ProseMirror img")).toBeVisible();
});

test("plugins: emoji shortcode keyboard insertion and ReUI search input", async ({
  page,
}) => {
  const editor = page.locator(".ProseMirror");
  await editor.fill("");
  await editor.pressSequentially(":smile");
  await expect(page.getByRole("button", { name: /:smile:$/ })).toBeVisible();
  await editor.press("Enter");
  await expect(editor).toContainText("😃");
  await page.getByRole("button", { name: "Emoji", exact: true }).click();
  const search = page.locator("[data-slot=emoji-picker-search]");
  await search.fill("grinning");
  await expect(search).toHaveValue("grinning");
  await expect(search).toHaveAttribute("class", /richtext-border-input/);
  await page.keyboard.press("Escape");
});

test("plugins: valid file chooser upload and embedded URL form are real ReUI flows", async ({
  page,
}) => {
  const editor = page.locator(".ProseMirror");
  await editor.fill("Upload");
  await page.getByRole("button", { name: "Image", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add an image" });
  const chooser = page.waitForEvent("filechooser");
  await dialog.getByRole("button", { name: "Upload", exact: true }).click();
  await (
    await chooser
  ).setFiles({
    name: "pixel.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==",
      "base64",
    ),
  });
  await expect(dialog).toHaveCount(0);
  await expect(editor.locator("img")).toBeVisible();
  await editor.press("ControlOrMeta+End");
  await editor.press("Enter");
  await page.getByRole("button", { name: "Iframe", exact: true }).click();
  await editor
    .getByPlaceholder("Enter link")
    .fill(new URL("vite.svg", page.url()).href);
  await editor.getByRole("button", { name: "OK", exact: true }).click();
  await expect(editor.locator("iframe")).toBeVisible();
  await expect(editor.locator("iframe")).toHaveAttribute("src", /vite.svg/);
});

test("latent plugins: attachment upload/delete, GIF selection and live TOC navigation", async ({
  page,
}) => {
  test.skip(
    Boolean(process.env.PLAYWRIGHT_BASE_URL),
    "Source fixture is intentionally not published",
  );
  await page.route("https://api.giphy.com/**", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        data: [
          {
            id: "test",
            images: {
              original: {
                url: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
              },
            },
          },
        ],
      }),
    }),
  );
  await page.goto("http://127.0.0.1:5199/tests/plugin-fixture.html");
  const editor = page.locator(".ProseMirror");
  await editor.click();
  await editor.press("ControlOrMeta+End");
  await page.getByRole("button", { name: "Attachment", exact: true }).click();
  await editor.locator("input[type=file]").setInputFiles({
    name: "example.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Fictional attachment"),
  });
  await expect(editor).toContainText("example.txt");
  await editor.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(editor).not.toContainText("example.txt");
  await page.getByRole("button", { name: "Gif", exact: true }).click();
  await page.getByPlaceholder("Search GIF").fill("fixture");
  const gif = page.getByRole("button", {
    name: "Insert GIF test",
    exact: true,
  });
  await expect(gif).toBeVisible();
  await gif.focus();
  await gif.press("Enter");
  await expect(editor.locator("img")).toHaveCount(1);
  await editor.press("ControlOrMeta+End");
  await editor.press("ArrowRight");
  await editor.press("Enter");
  await page
    .getByRole("button", { name: "Table of contents", exact: true })
    .click();
  const toc = editor.locator("[data-type=table-of-contents]");
  await expect(toc).toContainText("Fixture heading");
  await toc.getByRole("button", { name: /Fixture heading/ }).click();
  await expect(editor.locator("h1")).toBeInViewport();
});

test("plugins: Callout composes ReUI dialog, labelled form controls and an editable Alert node", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Callout", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Insert Callout" });
  await dialog.getByLabel("Callout Type").click();
  await page.getByRole("option", { name: "Warning", exact: true }).click();
  await dialog.getByLabel("Title", { exact: true }).fill("REUI-CALLOUT-TITLE");
  await dialog.getByLabel("Body Content").fill("REUI-CALLOUT-BODY");
  await dialog.getByRole("button", { name: "Insert", exact: true }).click();
  const note = page.getByRole("note");
  await expect(note).toContainText("REUI-CALLOUT-TITLE");
  await expect(note).toContainText("REUI-CALLOUT-BODY");
  await note.getByText("REUI-CALLOUT-BODY", { exact: true }).click();
  await page.getByRole("button", { name: "Edit Callout", exact: true }).click();
  const edit = page.getByRole("dialog", { name: "Edit Callout", exact: true });
  await expect(edit.getByLabel("Body Content")).toHaveValue(
    "REUI-CALLOUT-BODY",
  );
  await edit.getByLabel("Body Content").fill("REUI-CALLOUT-BODY-EDITED");
  await edit.getByRole("button", { name: "Insert", exact: true }).click();
  await expect(note).toContainText("REUI-CALLOUT-BODY-EDITED");
  await note.screenshot({ path: "test-results/reui-callout.png" });
});

test("shared editor: ReUI frame does not clip block controls; menu moving and undo operate on actual document blocks", async ({
  page,
}) => {
  const editor = page.locator(".ProseMirror");
  await editor.fill("ROOT-BLOCK-A");
  await editor.press("End");
  await editor.press("Enter");
  await page.keyboard.insertText("ROOT-BLOCK-B");
  await editor.getByText("ROOT-BLOCK-A", { exact: true }).hover();
  const grip = page.getByRole("button", {
    name: "Click for options, hold to drag",
    exact: true,
  });
  await expect(grip).toBeVisible();
  await grip.click();
  await page
    .getByRole("menuitem", { name: "Move block down", exact: true })
    .click();
  await expect(editor.locator(":scope > p")).toHaveText([
    "ROOT-BLOCK-B",
    "ROOT-BLOCK-A",
  ]);
  await editor.press("ControlOrMeta+z");
  await expect(editor.locator(":scope > p")).toHaveText([
    "ROOT-BLOCK-A",
    "ROOT-BLOCK-B",
  ]);
});
