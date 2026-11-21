import { expect, test } from '@playwright/test';
import { open } from './helpers';

// The page opens the controlled 视图 menu for the static comparison; close it first (it is modal).
test.beforeEach(async ({ page }) => {
  await open(page, 'Menu');
  await expect(page.getByRole('menu', { name: '视图' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu', { name: '视图' })).toBeHidden();
});

const trigger = (page: import('@playwright/test').Page) => page.getByRole('button', { name: '更多' });

test('opens on click, Esc closes and focus returns to the trigger', async ({ page }) => {
  await trigger(page).click();
  const menu = page.getByRole('menu', { name: '会话操作' });
  await expect(menu).toBeVisible();
  await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger(page)).toBeFocused();
});

test('keyboard: open with Enter, arrows move, Enter runs and closes', async ({ page }) => {
  await trigger(page).focus();
  await page.keyboard.press('Enter');
  const menu = page.getByRole('menu', { name: '会话操作' });
  await expect(menu.getByRole('menuitem', { name: '置顶' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: '标为未读' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('say')).toHaveText('已标为未读');
  await expect(menu).toBeHidden();
  await expect(trigger(page)).toBeFocused();
});

test('single-letter shortcuts work while the menu is open', async ({ page }) => {
  await trigger(page).click();
  await page.keyboard.press('a');
  await expect(page.getByTestId('say')).toHaveText('已归档');
  await expect(page.getByRole('menu', { name: '会话操作' })).toBeHidden();
});

test('checkbox item toggles and keeps the menu open; a disabled item can be reached but does nothing', async ({ page }) => {
  await trigger(page).click();
  const menu = page.getByRole('menu', { name: '会话操作' });
  const box = menu.getByRole('menuitemcheckbox', { name: '闲置时释放内存' });
  await expect(box).toHaveAttribute('aria-checked', 'true');
  await box.click();
  await expect(box).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByTestId('say')).toHaveText('闲置时释放内存：关');
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await trigger(page).focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowUp');
  await expect(menu.getByRole('menuitem', { name: '删除' })).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(menu.getByRole('menuitem', { name: '归档' })).toBeFocused();
  await page.keyboard.press('ArrowUp');
  const off = menu.getByRole('menuitem', { name: '移到分组' });
  await expect(off).toBeFocused();
  await expect(off).toHaveAttribute('aria-disabled', 'true');
  await page.keyboard.press('Enter');
  await expect(menu).toBeVisible();
  await page.keyboard.press('ArrowUp');
  await expect(box).toBeFocused();
  await page.keyboard.press(' ');
  await expect(box).toHaveAttribute('aria-checked', 'true');
  await expect(menu).toBeVisible();
});

test('submenu opens with ArrowRight and closes with ArrowLeft', async ({ page }) => {
  await trigger(page).click();
  const menu = page.getByRole('menu', { name: '会话操作' });
  const sub = menu.getByRole('menuitem', { name: '复制' });
  await sub.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('menuitem', { name: '复制会话标题' })).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(sub).toBeFocused();
});

test('controlled open state follows the trigger', async ({ page }) => {
  const view = page.getByRole('button', { name: /视图/ });
  await expect(view).toHaveText('视图：收起');
  await view.click();
  await expect(view).toHaveText('视图：展开');
  await expect(page.getByRole('menu', { name: '视图' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(view).toHaveText('视图：收起');
  await expect(page.getByRole('menu', { name: '视图' })).toBeHidden();
});
