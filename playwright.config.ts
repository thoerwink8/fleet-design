import { defineConfig } from '@playwright/test';

const port = Number(process.env.TEST_PORT || 5191);

// Interaction tests for the React components, against the preview pages in previews/react/.
export default defineConfig({
  testDir: 'test/react',
  fullyParallel: true,
  // Two workers on a developer machine; CI uses the default (one per core).
  workers: process.env.CI ? undefined : 2,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    browserName: 'chromium',
    viewport: { width: 1000, height: 800 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node scripts/serve.mjs',
    env: { PORT: String(port) },
    url: `http://127.0.0.1:${port}/react/Button.html`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
