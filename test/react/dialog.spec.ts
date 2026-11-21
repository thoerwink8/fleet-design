import { expect, type Page, test } from '@playwright/test';
import { open } from './helpers';

// The page opens the batch-delete confirmation for the static comparison; cancel it first.
test.beforeEach(async ({ page }) => {
  await open(page, 'Dialog');
  const first = page.getByRole('alertdialog', { name: '删除 4 个会话' });
  await expect(first).toBeVisible();
  await expect(first.getByRole('button', { name: '取消' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(first).toBeHidden();
});

const opener = (page: Page) => page.getByRole('button', { name: '删除 4 个会话…' });

test('confirm dialog: focus starts on cancel, Esc cancels, focus returns to the trigger', async ({ page }) => {
  await opener(page).click();
  const dlg = page.getByRole('alertdialog', { name: '删除 4 个会话' });
  await expect(dlg).toBeVisible();
  await expect(dlg).toHaveAccessibleDescription('将删除以下 4 个会话，删除后无法恢复。');
  await expect(dlg.getByRole('button', { name: '取消' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
  await expect(opener(page)).toBeFocused();
  await expect(page.getByTestId('say')).toHaveText('');
});

test('confirm dialog: Tab stays inside, the scrim does not dismiss, confirm runs the action', async ({ page }) => {
  await opener(page).click();
  const dlg = page.getByRole('alertdialog', { name: '删除 4 个会话' });
  await expect(dlg.getByRole('button', { name: '取消' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dlg.getByRole('button', { name: '删除 4 个会话' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dlg.getByRole('button', { name: '取消' })).toBeFocused();
  await page.mouse.click(5, 5);
  await expect(dlg).toBeVisible();
  await dlg.getByRole('button', { name: '删除 4 个会话' }).click();
  await expect(dlg).toBeHidden();
  await expect(page.getByTestId('say')).toHaveText('已删除 4 个会话');
});

test('controlled confirm dialog opens from state', async ({ page }) => {
  await page.getByRole('button', { name: '还原文件…' }).click();
  const dlg = page.getByRole('alertdialog', { name: '还原这个文件？' });
  await expect(dlg).toBeVisible();
  await dlg.getByRole('button', { name: '还原文件' }).click();
  await expect(dlg).toBeHidden();
  await expect(page.getByTestId('say')).toHaveText('已还原');
});

test('dialog: focus goes inside, scrim click closes, value change is kept', async ({ page }) => {
  const trigger = page.getByRole('button', { name: '重命名…' });
  await trigger.click();
  const dlg = page.getByRole('dialog', { name: '重命名会话' });
  await expect(dlg).toBeVisible();
  const input = dlg.getByRole('textbox', { name: '会话标题' });
  await expect(input).toBeFocused();
  await input.fill('登录超时复盘');
  await dlg.getByRole('button', { name: '保存' }).click();
  await expect(page.getByTestId('say')).toHaveText('已重命名为「登录超时复盘」');
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(dlg).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(dlg).toBeHidden();
});

async function assertFocusTrapped(page: Page, dlg: import('@playwright/test').Locator) {
  const initial = await dlg.evaluate((el) => {
    const ae = document.activeElement;
    return { inside: el.contains(ae), isBody: ae === document.body, tag: ae?.tagName ?? '' };
  });
  expect(initial.inside, `initial focus leaked to ${initial.tag}`).toBe(true);
  expect(initial.isBody).toBe(false);

  for (const key of ['Tab', 'Shift+Tab'] as const) {
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press(key);
      const step = await dlg.evaluate((el) => {
        const ae = document.activeElement;
        return {
          inside: el.contains(ae),
          isBody: ae === document.body,
          tag: ae?.tagName ?? '',
          cls: typeof ae?.className === 'string' ? ae.className : '',
        };
      });
      expect(step.isBody, `${key} #${i + 1}: focus landed on BODY`).toBe(false);
      expect(step.inside, `${key} #${i + 1}: focus escaped to <${step.tag} class="${step.cls}">`).toBe(true);
    }
  }
}

test('Tab and Shift+Tab stay inside ConfirmDialog and Dialog for 20 presses each', async ({ page }) => {
  await opener(page).click();
  const confirm = page.getByRole('alertdialog', { name: '删除 4 个会话' });
  await expect(confirm).toBeVisible();
  await expect(confirm.getByRole('button', { name: '取消' })).toBeFocused();
  await assertFocusTrapped(page, confirm);
  await page.keyboard.press('Escape');
  await expect(confirm).toBeHidden();

  await page.getByRole('button', { name: '重命名…' }).click();
  const dialog = page.getByRole('dialog', { name: '重命名会话' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: '会话标题' })).toBeFocused();
  await assertFocusTrapped(page, dialog);
});
