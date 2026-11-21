import { expect, test } from '@playwright/test';
import { open } from './helpers';

test.beforeEach(async ({ page }) => open(page, 'Drawer'));

test('controlled: open on load, Esc closes and focus returns to the menu button', async ({ page }) => {
  const drawer = page.getByRole('dialog', { name: '会话列表' });
  await expect(drawer).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(page.getByRole('button', { name: '打开会话列表' })).toBeFocused();
  await expect(drawer).toHaveCount(0);
});

test('picking an item closes it and updates state; scrim closes it', async ({ page }) => {
  const drawer = page.getByRole('dialog', { name: '会话列表' });
  await drawer.getByRole('button', { name: '修复 sandbox 目录读取' }).click();
  await expect(drawer).toHaveCount(0);
  await expect(page.getByTestId('say')).toHaveText('当前会话：修复 sandbox 目录读取');
  await page.getByRole('button', { name: '打开会话列表' }).click();
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveCSS('transform', 'none');
  await page.mouse.click(900, 400);
  await expect(drawer).toHaveCount(0);
});

test('focus is trapped inside while open', async ({ page }) => {
  const drawer = page.getByRole('dialog', { name: '会话列表' });
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    await expect(drawer.locator(':focus')).toHaveCount(1);
  }
});
