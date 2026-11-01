import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.', testMatch: '*.pw.ts', reporter: 'list', workers: 1,
  outputDir: '/tmp/eegbot-mobile-results',
  use: { headless: true, launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/home/ubuntu/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome' } },
  projects: [360,390,768].map(width => ({name: `${width}px`, use: {viewport: {width,height:844}, hasTouch: true, isMobile: true}})),
  webServer: [
    {command: '/home/ubuntu/.bun/bin/bun scripts/serve-site.ts', cwd: '../..', url:'http://127.0.0.1:4178/EEGbot/', reuseExistingServer:false},
    {command: '/home/ubuntu/.bun/bin/bun ui/server.ts', cwd: '../..', url:'http://127.0.0.1:3479/app/', env:{HOST:'127.0.0.1',PORT:'3479'}, reuseExistingServer:false},
  ],
});
