import { defineConfig } from 'playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4173', browserName: 'chromium' },
  webServer: { command: 'npm run build && exec ./node_modules/.bin/vite preview --host 127.0.0.1 --strictPort', url: 'http://127.0.0.1:4173', reuseExistingServer: false, timeout: 120_000 }
});
