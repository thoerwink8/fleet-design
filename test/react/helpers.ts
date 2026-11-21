import type { Page } from '@playwright/test';

/** Opens a React preview page and waits until the demo has mounted. */
export async function open(page: Page, name: string, query = 'theme=light') {
  await page.goto(`/react/${name}.html?${query}`);
  await page.locator('body[data-ready]').waitFor({ state: 'attached' });
}
