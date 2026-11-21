import { expect, test } from '@playwright/test';
import { open } from './helpers';

test.beforeEach(async ({ page }) => open(page, 'Meter'));

test('meter role and values', async ({ page }) => {
  const thin = page.getByRole('meter', { name: '上下文占用', exact: true });
  await expect(thin).toHaveAttribute('aria-valuenow', '10');
  await expect(thin).toHaveAttribute('aria-valuemax', '100');
  await expect(page.locator('.fa-num', { hasText: '10%' })).toBeVisible();
});

test('controlled value moves the fill and turns danger at 95%', async ({ page }) => {
  const m = page.getByRole('meter', { name: '上下文占用（可调）' });
  const fill = m.locator('i');
  await expect(m).toHaveAttribute('aria-valuenow', '70');
  await expect(fill).not.toHaveClass(/fa-meter__fill--full/);
  await page.getByRole('button', { name: '加 25%' }).click();
  await expect(m).toHaveAttribute('aria-valuenow', '95');
  await expect(fill).toHaveClass(/fa-meter__fill--full/);
  const danger = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--danger').trim());
  expect(danger).not.toBe('');
});

test('segments use the data colours in order and keep a 1px gap', async ({ page }) => {
  const seg = page.getByRole('meter', { name: '上下文构成' });
  await expect(seg.locator('i')).toHaveCount(4);
  await expect(seg).toHaveCSS('column-gap', '1px');
  await expect(seg.locator('i').first()).toHaveClass('fa-s1');
});
