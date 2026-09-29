import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', timeout: 30_000, fullyParallel: true, workers: 2,
  reporter: 'list', outputDir: 'test-results',
  use: { baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000', channel: 'chrome', headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
});
