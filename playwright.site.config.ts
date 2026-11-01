import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/site-e2e', testMatch:'**/*.pw.ts', reporter:'list',
  use:{baseURL:'http://127.0.0.1:4178', screenshot:'only-on-failure', launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? {executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE} : {}}, 
  projects:[{name:'site-desktop',use:{...devices['Desktop Chrome']}},{name:'site-mobile',use:{...devices['Pixel 7']}}],
  webServer:{command:'bun scripts/serve-site.ts',url:'http://127.0.0.1:4178/EEGbot/',reuseExistingServer:false}
});
