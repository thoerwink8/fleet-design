import { expect, test } from '@playwright/test';
import { open } from './helpers';

test.beforeEach(async ({ page }) => open(page, 'Checkbox'));

test('click on the label toggles; Space toggles with keyboard focus', async ({ page }) => {
  const box = page.getByRole('checkbox', { name: '闲置时释放内存' });
  await expect(box).toBeChecked();
  await page.getByText('闲置时释放内存').click();
  await expect(box).not.toBeChecked();
  await expect(page.getByTestId('say')).toContainText('释放内存：关');
  await box.focus();
  await page.keyboard.press(' ');
  await expect(box).toBeChecked();
});

test('select-all shows mixed and follows the rows', async ({ page }) => {
  const all = page.getByRole('checkbox', { name: '全选' });
  await expect(all).toHaveAttribute('aria-checked', 'mixed');
  await all.click();
  await expect(page.getByTestId('say')).toContainText('已选 3 项');
  await expect(all).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('checkbox', { name: '修复 sandbox 目录读取' }).click();
  await expect(all).toHaveAttribute('aria-checked', 'mixed');
});

test('disabled checkbox ignores clicks and is skipped by Tab', async ({ page }) => {
  const box = page.getByRole('checkbox', { name: '托管策略锁定' });
  await expect(box).toBeChecked();
  await expect(box).toHaveAttribute('aria-disabled', 'true');
  await page.getByText('托管策略锁定').click({ force: true });
  await expect(box).toBeChecked();
  await page.getByRole('checkbox', { name: '显示已归档' }).focus();
  await page.keyboard.press('Tab');
  await expect(box).not.toBeFocused();
});
