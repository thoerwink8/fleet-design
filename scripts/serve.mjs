// The preview server alone, for the Playwright interaction tests (started and stopped by Playwright itself).
import { createPreviewServer, listen } from './lib/preview.mjs';

const port = await listen(createPreviewServer(), Number(process.env.PORT || 5191));
console.log(`preview server for tests at http://127.0.0.1:${port}/`);
