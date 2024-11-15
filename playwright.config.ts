import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173', // Vite 개발 서버 포트
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
  ],

  // 중요! 서버와 Vite를 함께 실행하도록 설정
  webServer: [
    {
      // Express 서버
      command: 'pnpm run server',
      port: 3000,
      reuseExistingServer: true,
    },
    {
      // Vite 개발 서버
      command: 'pnpm run start',
      port: 5173,
      reuseExistingServer: true,
      timeout: 120000, // 2분
    },
  ],
});
