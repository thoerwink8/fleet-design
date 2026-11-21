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
  await expect(page.getByRole('menu', { name: '会话操作' })).toBeVisible();
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

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function intersects(a: Box, b: Box): boolean {
  return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
}

test('narrow viewport keeps submenu inside viewport without overlapping trigger or sibling items; wide viewport opens right', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await trigger(page).click();
  const menu = page.getByRole('menu', { name: '会话操作' });
  await expect(menu).toBeVisible();
  const subTrigger = menu.getByRole('menuitem', { name: '复制', exact: true });
  await subTrigger.focus();
  await page.keyboard.press('ArrowRight');
  const subItem = page.getByRole('menuitem', { name: '复制会话标题' });
  await expect(subItem).toBeVisible();
  await expect(subItem).toBeFocused();

  const subMenu = page.getByRole('menu', { name: '复制' });
  await expect(subMenu).toBeVisible();
  const subRect = await subMenu.boundingBox();
  const trigRect = await subTrigger.boundingBox();
  expect(subRect).not.toBeNull();
  expect(trigRect).not.toBeNull();
  if (!subRect || !trigRect) return;

  const subBox: Box = { left: subRect.x, top: subRect.y, right: subRect.x + subRect.width, bottom: subRect.y + subRect.height };
  const trigBox: Box = { left: trigRect.x, top: trigRect.y, right: trigRect.x + trigRect.width, bottom: trigRect.y + trigRect.height };

  expect(subBox.left).toBeGreaterThanOrEqual(8);
  expect(subBox.right).toBeLessThanOrEqual(360 - 8);
  expect(subBox.top).toBeGreaterThanOrEqual(0);
  expect(subBox.bottom).toBeLessThanOrEqual(740);
  expect(intersects(subBox, trigBox)).toBe(false);

  const siblings = await menu.evaluate((el) => {
    const items = [...el.querySelectorAll(':scope > [role=menuitem], :scope > [role=menuitemcheckbox]')];
    return items
      .filter((item) => !item.textContent?.includes('复制'))
      .map((item) => {
        const r = item.getBoundingClientRect();
        return { text: item.textContent?.trim() ?? '', left: r.left, top: r.top, right: r.right, bottom: r.bottom };
      });
  });
  for (const sib of siblings) {
    expect(intersects(subBox, sib), `submenu overlapped parent item "${sib.text}"`).toBe(false);
  }

  await page.keyboard.press('ArrowLeft');
  await expect(subMenu).toBeHidden();
  await expect(subTrigger).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect(subItem).toBeVisible();
  await subItem.click();
  await expect(page.getByTestId('say')).toHaveText('已复制会话标题');

  await page.setViewportSize({ width: 1280, height: 800 });
  await trigger(page).click();
  await subTrigger.focus();
  await page.keyboard.press('ArrowRight');
  await expect(subItem).toBeVisible();
  const wideSubRect = await subMenu.boundingBox();
  const wideTrigRect = await subTrigger.boundingBox();
  expect(wideSubRect).not.toBeNull();
  expect(wideTrigRect).not.toBeNull();
  if (!wideSubRect || !wideTrigRect) return;
  expect(wideSubRect.x).toBeGreaterThanOrEqual(wideTrigRect.x + wideTrigRect.width);
  expect(wideSubRect.x + wideSubRect.width).toBeLessThanOrEqual(1280 - 8);
  await expect(subMenu).toHaveAttribute('data-side', 'right');
});
