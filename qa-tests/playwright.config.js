require('dotenv').config();

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: '.',
  timeout:  parseInt(process.env.PW_TIMEOUT  || '15000', 10),
  retries:  parseInt(process.env.PW_RETRIES  || '1',     10),
  workers:  parseInt(process.env.PW_WORKERS  || '2',     10),
  use: {
    baseURL:       (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, ''),
    headless:      process.env.HEADLESS !== 'false',
    actionTimeout: parseInt(process.env.PW_TIMEOUT || '10000', 10),
    screenshot:    'only-on-failure',
    video:         'retain-on-failure',
    trace:         'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  reporter: [
    ['list'],
    ['html',  { outputFolder: 'playwright-report', open: 'never' }],
    ['json',  { outputFile:   'test-results/results.json' }],
  ],
};

module.exports = config;
