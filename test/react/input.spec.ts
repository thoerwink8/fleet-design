import { expect, test } from '@playwright/test';
import { open } from './helpers';

test.beforeEach(async ({ page }) => open(page, 'Input'));

test('label and hint are linked to the input', async ({ page }) => {
  const input = page.getByRole('textbox', { name: '会话标题' });
  await expect(input).toHaveValue('排查登录超时');
  await expect(input).toHaveAccessibleDescription('留空则恢复自动标题。最长 20 个字。');
});

test('error state follows the controlled value', async ({ page }) => {
  const input = page.getByRole('textbox', { name: '分支名' });
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAccessibleDescription(/不能有空格/);
  await input.fill('local/42-login-fix');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAccessibleDescription('字母、数字、/ 和 -');
});

test('prefix and suffix sit inside the frame; keyboard focus rings the frame', async ({ page }) => {
  const input = page.getByRole('textbox', { name: '单次花费上限' });
  await page.getByRole('textbox', { name: '分支名' }).focus();
  await page.keyboard.press('Tab');
  await expect(input).toBeFocused();
  const frame = page.locator('.fa-input--group');
  await expect(frame).toHaveCSS('outline-style', 'solid');
  await input.fill('3.50');
  await expect(input).toHaveValue('3.50');
});

test('disabled input is not editable and is skipped by Tab', async ({ page }) => {
  const input = page.getByRole('textbox', { name: '工作区路径' });
  await expect(input).toBeDisabled();
  await page.getByRole('textbox', { name: '单次花费上限' }).focus();
  await page.keyboard.press('Tab');
  await expect(input).not.toBeFocused();
});
