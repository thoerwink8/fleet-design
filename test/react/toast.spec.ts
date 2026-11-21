import { expect, test } from '@playwright/test';
import { open } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await open(page, 'Toast');
});

const region = (page: import('@playwright/test').Page) => page.getByRole('region', { name: '通知' });

test('demo toast is in the region with its undo action and close button', async ({ page }) => {
  const t = region(page).locator('.fa-toast', { hasText: '已归档「排查登录超时」' });
  await expect(t).toBeVisible();
  await t.getByRole('button', { name: '撤销' }).click();
  await expect(page.getByTestId('say')).toHaveText('已恢复');
});

test('a plain toast leaves after 4 s, one with undo after 8 s', async ({ page }) => {
  await page.getByRole('button', { name: '复制 Session ID' }).click();
  await page.getByRole('button', { name: '归档会话' }).click();
  const plain = region(page).locator('.fa-toast', { hasText: '已复制 Session ID' });
  const undo = region(page).locator('.fa-toast', { hasText: '已归档第 1 个会话' });
  await expect(plain).toBeVisible();
  await expect(undo).toBeVisible();
  await page.mouse.move(0, 0);
  await page.clock.runFor(4500);
  await expect(plain).toHaveCount(0);
  await expect(undo).toBeVisible();
  await page.clock.runFor(4000);
  await expect(undo).toHaveCount(0);
});

test('hovering the stack pauses the timers', async ({ page }) => {
  await page.getByRole('button', { name: '复制 Session ID' }).click();
  const plain = region(page).locator('.fa-toast', { hasText: '已复制 Session ID' });
  await plain.hover();
  await page.clock.runFor(6000);
  await expect(plain).toBeVisible();
  await page.mouse.move(0, 0);
  await page.clock.runFor(5000);
  await expect(plain).toHaveCount(0);
});

test('queue keeps at most three; close button removes one', async ({ page }) => {
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: '归档会话' }).click();
  await expect(region(page).locator('.fa-toast:visible')).toHaveCount(3);
  await expect(region(page).locator('.fa-toast:visible', { hasText: '已归档第 4 个会话' })).toBeVisible();
  const last = region(page).locator('.fa-toast', { hasText: '已归档第 4 个会话' });
  // Base UI keeps the close button out of the accessibility tree until the stack is focused, so find it by label.
  const close = last.locator('button[aria-label=关闭]');
  await close.click();
  await expect(last).toHaveCount(0);
});
