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
  await expect(options(page)).toHaveCount(5);
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

test('arrow keys move across groups and wrap; Enter runs and closes', async ({ page }) => {
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(options(page).nth(2)).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await expect(options(page).nth(4)).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: '命令面板' })).toHaveCount(0);
  await expect(page.getByTestId('say')).toHaveText('打开设置');
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
