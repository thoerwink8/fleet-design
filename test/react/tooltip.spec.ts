import { expect, test } from '@playwright/test';
import { open } from './helpers';

test.beforeEach(async ({ page }) => open(page, 'Tooltip'));

test('hover opens after the delay and shows the shortcut', async ({ page }) => {
  const trigger = page.getByRole('button', { name: '新建会话' });
  await trigger.hover();
  const tip = page.locator('.fa-tip', { hasText: '新建会话' });
  await expect(tip).toBeVisible();
  await expect(tip.locator('.fa-kbd')).toHaveText('Ctrl+N');
  await page.mouse.move(0, 0);
  await expect(tip).toBeHidden();
});

test('keyboard focus opens, Esc closes and focus stays on the trigger', async ({ page }) => {
  await page.getByRole('button', { name: '固定展开的提示' }).focus();
  await page.keyboard.press('Tab');
  const trigger = page.getByRole('button', { name: '新建会话' });
  await expect(trigger).toBeFocused();
  const tip = page.locator('.fa-tip', { hasText: '新建会话' });
  await expect(tip).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tip).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('controlled open state', async ({ page }) => {
  const trigger = page.getByRole('button', { name: '归档对话' });
  await expect(trigger).toHaveText('受控：关');
  await trigger.hover();
  await expect(page.locator('.fa-tip', { hasText: '归档对话' })).toBeVisible();
  await expect(trigger).toHaveText('受控：开');
});
