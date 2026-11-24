import { expect, test } from '@playwright/test';
import { open } from './helpers';

test.beforeEach(async ({ page }) => open(page, 'Button'));

test('click and keyboard activate a button', async ({ page }) => {
  await page.getByRole('button', { name: '取消' }).click();
  await expect(page.getByTestId('say')).toHaveText('次按钮：取消');
  await page.getByRole('button', { name: '编辑' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('say')).toHaveText('幽灵按钮：编辑');
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: '取消' })).toBeFocused();
});

test('icon buttons have an accessible name', async ({ page }) => {
  await page.getByRole('button', { name: '复制路径' }).click();
  await expect(page.getByTestId('say')).toHaveText('已复制路径');
});

test('loading keeps focus, ignores clicks and announces busy', async ({ page }) => {
  const b = page.getByRole('button', { name: '压缩会话' });
  await b.click();
  const busy = page.getByRole('button', { name: '压缩中…' });
  await expect(busy).toHaveAttribute('aria-busy', 'true');
  await expect(busy).toBeFocused();
  await expect(busy).not.toHaveAttribute('disabled', /.*/);
  await busy.click({ force: true });
  await expect(page.getByTestId('say')).toHaveText('开始压缩');
  await expect(page.getByRole('button', { name: '压缩会话' })).toBeVisible();
  await expect(page.getByTestId('say')).toHaveText('压缩完成');
});

test('aria-disabled and data-disabled use the disabled look and do not take a hover fill', async ({ page }) => {
  const aria = page.locator('.fa-btn--primary[aria-disabled="true"]');
  const data = page.locator('.fa-btn--secondary[data-disabled]:not([disabled])');
  await expect(aria).toHaveCSS('cursor', 'not-allowed');
  await expect(data).toHaveCSS('cursor', 'not-allowed');
  await aria.hover();
  await expect(aria).toHaveCSS('background-image', 'none');
  await data.hover();
  await expect(data).toHaveCSS('background-image', 'none');
  const svg = page.locator('#rawic svg');
  const box = await svg.boundingBox();
  expect(Math.round(box?.width ?? 0)).toBe(16);
  expect(Math.round(box?.height ?? 0)).toBe(16);
});

test('disabled buttons are not focusable and say why', async ({ page }) => {
  const b = page.getByRole('button', { name: '继续发送', description: '没有排队消息，所以不能继续发送或撤回' });
  await expect(b).toBeDisabled();
  await page.getByRole('button', { name: '压缩会话' }).focus();
  await page.keyboard.press('Tab');
  await expect(b).not.toBeFocused();
});
