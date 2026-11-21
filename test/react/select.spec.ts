import { expect, test } from '@playwright/test';
import { open } from './helpers';

test.beforeEach(async ({ page }) => open(page, 'Select'));

test('click opens the list under the trigger and picks a value', async ({ page }) => {
  const trigger = page.getByRole('combobox', { name: '字号' });
  await expect(trigger).toHaveText(/较大/);
  await trigger.click();
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  await expect(list.getByRole('option', { name: '较大' })).toHaveAttribute('aria-selected', 'true');
  await list.getByRole('option', { name: '超大' }).click();
  await expect(trigger).toHaveText(/超大/);
  await expect(page.getByTestId('say')).toHaveText('字号 18');
  await expect(trigger).toBeFocused();
});

test('keyboard: arrows move, Enter picks, Esc closes and returns focus', async ({ page }) => {
  const trigger = page.getByRole('combobox', { name: '字号' });
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveText(/标准/);
  await expect(list).toBeHidden();
  await page.keyboard.press('ArrowDown');
  await expect(list).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(list).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveText(/标准/);
});

test('ghost variant: uncontrolled value and disabled option', async ({ page }) => {
  const trigger = page.getByRole('combobox', { name: '强度' });
  await expect(trigger).toHaveClass(/fa-select--ghost/);
  await trigger.click();
  await expect(page.getByRole('option', { name: '最高强度' })).toHaveAttribute('aria-disabled', 'true');
  await page.getByRole('option', { name: '高强度', exact: true }).click();
  await expect(trigger).toHaveText(/高强度/);
  await expect(page.getByTestId('say')).toHaveText('强度 high');
});

test('placeholder shows until a value is chosen', async ({ page }) => {
  await expect(page.getByRole('combobox', { name: '分组' })).toHaveText(/选择分组/);
});

async function accessibleListboxes(page: import('@playwright/test').Page) {
  return page.evaluate(
    () =>
      [...document.querySelectorAll('[role=listbox]')].filter((el) => {
        const hidden = (el as HTMLElement).hidden || el.getAttribute('aria-hidden') === 'true';
        const display = getComputedStyle(el).display;
        return !(hidden && display === 'none');
      }).length,
  );
}

test('closing leaves no screen-reader-accessible listbox node', async ({ page }) => {
  const trigger = page.getByRole('combobox', { name: '字号' });
  await trigger.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect.poll(() => accessibleListboxes(page)).toBe(0);

  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveText(/标准/);
  await expect(trigger).toBeFocused();
  await expect.poll(() => accessibleListboxes(page)).toBe(0);

  await page.keyboard.press('ArrowDown');
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  await expect(list.getByRole('option', { name: '标准' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Escape');
  await expect(list).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect.poll(() => accessibleListboxes(page)).toBe(0);
});
