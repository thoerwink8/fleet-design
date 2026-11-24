import { expect, type Page, test } from '@playwright/test';
import { open } from './helpers';

test.beforeEach(async ({ page }) => {
  await open(page, 'CommandPalette');
  await expect(page.getByRole('combobox', { name: '命令面板' })).toBeFocused();
});

const box = (page: Page) => page.getByRole('combobox', { name: '命令面板' });
const options = (page: Page) => page.getByRole('listbox', { name: '命令面板' }).getByRole('option');

test('opens with focus in the input; groups and the first option are active', async ({ page }) => {
  await expect(box(page)).toBeFocused();
  await expect(page.getByRole('group', { name: '会话' })).toBeVisible();
  await expect(page.getByRole('group', { name: '命令' })).toBeVisible();
  await expect(options(page)).toHaveCount(7);
  await expect(options(page).first()).toHaveAttribute('aria-selected', 'true');
  const active = await options(page).first().getAttribute('id');
  await expect(box(page)).toHaveAttribute('aria-activedescendant', active ?? '');
});

test('typing filters by title and keywords; no match says so', async ({ page }) => {
  await box(page).fill('theme');
  await expect(options(page)).toHaveCount(1);
  await expect(options(page).first()).toContainText('切换主题');
  await box(page).fill('登录');
  await expect(options(page)).toHaveCount(1);
  await expect(page.locator('.fa-mark')).toHaveText('登录');
  await box(page).fill('不存在的东西');
  await expect(options(page)).toHaveCount(0);
  await expect(page.getByText('没有匹配的结果')).toBeVisible();
});

test('arrow keys move across groups, skip disabled rows, and wrap; Enter runs and closes', async ({ page }) => {
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(options(page).nth(2)).toHaveAttribute('aria-selected', 'true');
  // Up wraps past the disabled last row onto the last enabled row.
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await expect(options(page).nth(5)).toHaveAttribute('aria-selected', 'true');
  await expect(options(page).nth(6)).toHaveAttribute('aria-selected', 'false');
  await expect(options(page).nth(6)).toHaveAttribute('data-active', 'false');
  await page.keyboard.press('ArrowDown');
  await expect(options(page).nth(0)).toHaveAttribute('aria-selected', 'true');
  await expect(options(page).nth(6)).toHaveAttribute('aria-selected', 'false');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: '命令面板' })).toHaveCount(0);
  await expect(page.getByTestId('say')).toHaveText('打开会话：排查登录超时');
});

test('Esc closes and focus returns; Ctrl+K reopens with an empty query', async ({ page }) => {
  await box(page).fill('设置');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: '命令面板' })).toHaveCount(0);
  await page.getByRole('button', { name: '打开命令面板' }).click();
  await expect(box(page)).toHaveValue('');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: '打开命令面板' })).toBeFocused();
  await page.keyboard.press('Control+k');
  await expect(box(page)).toBeFocused();
});

test('clicking a result runs it', async ({ page }) => {
  await options(page).filter({ hasText: '修复 sandbox 目录读取' }).click();
  await expect(page.getByTestId('say')).toHaveText('打开会话：修复 sandbox 目录读取');
});
test('a summary-only row gets fa-cmd__row--2 at 52px; a disabled row is marked and does not run', async ({ page }) => {
  const two = options(page).filter({ hasText: '同步设置到所有工作区' });
  await expect(two).toHaveClass(/fa-cmd__row--2/);
  expect(Math.round((await two.boundingBox())?.height ?? 0)).toBe(52);
  const off = options(page).filter({ hasText: '重新生成会话摘要' });
  await expect(off).toHaveAttribute('aria-disabled', 'true');
  await expect(off).toHaveClass(/fa-cmd__row--2/);
  // aria-disabled options are not clickable, so dispatch the event: the component must ignore it.
  await off.dispatchEvent('click');
  await expect(page.getByRole('dialog', { name: '命令面板' })).toBeVisible();
  await expect(page.getByTestId('say')).not.toHaveText('不应执行');
});

test('Ctrl+End skips the disabled last row, Ctrl+Home returns to the first, and hovering a disabled row does not highlight it', async ({
  page,
}) => {
  await page.keyboard.press('Control+End');
  await expect(options(page).nth(5)).toHaveAttribute('aria-selected', 'true');
  await expect(options(page).nth(6)).toHaveAttribute('aria-selected', 'false');
  await page.keyboard.press('Control+Home');
  await expect(options(page).nth(0)).toHaveAttribute('aria-selected', 'true');
  await options(page).nth(6).hover({ force: true });
  await expect(options(page).nth(6)).toHaveAttribute('aria-selected', 'false');
  await expect(options(page).nth(6)).toHaveAttribute('data-active', 'false');
  await expect(options(page).nth(0)).toHaveAttribute('aria-selected', 'true');
});
