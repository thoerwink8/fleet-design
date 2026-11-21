import { expect, test } from '@playwright/test';
import { open } from './helpers';

test.beforeEach(async ({ page }) => open(page, 'SegmentedControl'));

test('radio semantics and controlled value', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: '字号' });
  await expect(group.getByRole('radio', { name: '较大' })).toHaveAttribute('aria-checked', 'true');
  await group.getByRole('radio', { name: '超大' }).click();
  await expect(group.getByRole('radio', { name: '超大' })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByTestId('sample')).toHaveCSS('font-size', '18px');
  await expect(page.getByTestId('say')).toHaveText('字号 18');
});

test('Tab enters at the checked item and arrow keys move and select', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: '字号' });
  await group.getByRole('radio', { name: '较大' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(group.getByRole('radio', { name: '超大' })).toBeFocused();
  await expect(group.getByRole('radio', { name: '超大' })).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(group.getByRole('radio', { name: '标准' })).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('radiogroup', { name: '动效' }).getByRole('radio', { name: '标准' })).toBeFocused();
});

test('uncontrolled group keeps its own value; disabled items are skipped', async ({ page }) => {
  const motion = page.getByRole('radiogroup', { name: '动效' });
  await motion.getByRole('radio', { name: '减弱' }).click();
  await expect(motion.getByRole('radio', { name: '减弱' })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByTestId('say')).toHaveText('动效 reduced');
  const ctx = page.getByRole('radiogroup', { name: '上下文' });
  await ctx.getByRole('radio', { name: '200K' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(ctx.getByRole('radio', { name: '200K' })).toHaveAttribute('aria-checked', 'true');
  await expect(ctx.getByRole('radio', { name: '1M' })).toBeDisabled();
});
