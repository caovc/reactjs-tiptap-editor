import { expect, test } from '@playwright/test';
let errors: string[];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('http://127.0.0.1:5199/tests/reui-controls.html');
});
test.afterEach(() => expect(errors).toEqual([]));

test('ReUI native controls, switch, checkbox, select, toggle and tabs', async ({ page }) => {
  await page.getByLabel('Name', { exact: true }).fill('Migrated');
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Migrated');
  await page.getByLabel('Notes', { exact: true }).fill('Textarea verification');
  await expect(page.getByLabel('Notes', { exact: true })).toHaveValue('Textarea verification');
  await page.getByRole('checkbox', { name: 'Enabled', exact: true }).check();
  await expect(page.getByRole('checkbox')).toBeChecked();
  await page.getByRole('switch', { name: 'Notifications' }).click();
  await expect(page.getByRole('switch')).toBeChecked();
  await page.getByRole('button', { name: 'Mark', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mark', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await page.getByRole('combobox', { name: 'Choice' }).click();
  await page.getByRole('option', { name: 'Two', exact: true }).click();
  await expect(page.getByRole('combobox')).toContainText('Two');
  await page.getByRole('tab', { name: 'Second', exact: true }).click();
  await expect(page.getByRole('tabpanel')).toHaveText('Second panel');
  await expect(page.getByRole('separator')).toHaveAttribute('data-orientation', 'horizontal');
  await expect(page.getByRole('button', { name: 'Disabled', exact: true })).toBeDisabled();
});

test('ReUI overlays, focus restoration, tooltip, semantic button styles and notifications', async ({
  page,
}) => {
  await expect(page.getByLabel('Ref result')).toHaveText('forwarded');
  const trigger = page.getByRole('button', { name: 'Dialog', exact: true });
  await expect(trigger).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Control dialog' });
  await expect(dialog).toBeInViewport();
  await expect(dialog).toHaveCSS('border-top-style', 'solid');
  await expect(dialog.getByRole('textbox')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Select action' }).click();
  await expect(page.getByLabel('Menu result')).toHaveText('selected');
  await page.getByRole('button', { name: 'Popover', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Details' })).toBeInViewport();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Hint', exact: true }).hover();
  await expect(page.getByRole('tooltip')).toHaveText('Helpful hint');
  await page.getByRole('button', { name: 'Notify', exact: true }).click();
  await expect(page.getByText('Notification delivered', { exact: true })).toBeVisible();
  await expect(page.locator('[data-sonner-toast][data-type=error]')).toBeVisible();
  await page.getByRole('button', { name: 'Update notification', exact: true }).click();
  await expect(page.getByText('Notification updated', { exact: true })).toBeVisible();
  await expect(page.locator('[data-sonner-toast][data-type=error]')).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss notification', exact: true }).click();
  await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
});
