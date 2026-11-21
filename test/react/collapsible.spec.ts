import { expect, test } from '@playwright/test';
import { open } from './helpers';

test.beforeEach(async ({ page }) => open(page, 'Collapsible'));

test('section head toggles by click and keyboard, aria-expanded follows', async ({ page }) => {
  const head = page.getByRole('button', { name: /^环境/ });
  await expect(head).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('acme-web')).toBeVisible();
  await head.click();
  await expect(head).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText('acme-web')).toBeHidden();
  await expect(page.getByTestId('say')).toHaveText('环境：收起');
  await head.focus();
  await page.keyboard.press('Enter');
  await expect(head).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press(' ');
  await expect(head).toHaveAttribute('aria-expanded', 'false');
});

test('uncontrolled section starts closed and opens', async ({ page }) => {
  const head = page.getByRole('button', { name: /^上下文/ });
  await expect(head).toHaveAttribute('aria-expanded', 'false');
  await head.click();
  await expect(page.getByText('48K')).toBeVisible();
});

test('fold row opens the list and keeps focus on its head', async ({ page }) => {
  const sum = page.getByRole('button', { name: /跑了 12 条命令/ });
  await expect(sum).toHaveAttribute('aria-expanded', 'false');
  await sum.focus();
  await page.keyboard.press('Enter');
  await expect(sum).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('button', { name: 'git diff --stat' })).toBeVisible();
  await expect(sum).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'pnpm vitest run --reporter=dot' })).toBeFocused();
});
