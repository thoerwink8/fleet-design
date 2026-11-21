import { chromium } from 'playwright';
import { cards, createPreviewServer, listen, previewPages } from './preview.mjs';

let session;

// One preview server and one headless Chromium shared by the browser checks of a single pnpm check run.
export function browserSession() {
  session ||= (async () => {
    const server = createPreviewServer();
    const port = await listen(server, 0);
    const browser = await chromium.launch();
    return { base: `http://127.0.0.1:${port}`, browser, server, cards: cards().map((c) => c.name), pages: previewPages() };
  })();
  return session;
}

export async function closeBrowserSession() {
  if (!session) return;
  const { browser, server } = await session;
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  session = undefined;
}
