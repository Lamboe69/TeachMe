import { defineConfig } from '@playwright/test';

/**
 * Playwright configuration for end-to-end smoke tests.
 *
 * These tests run against a running dev server (Vite) in demo mode. They are
 * intentionally separate from the vitest unit tests — they exercise the full
 * navigation, auth, booking, and tutor-action flows as a real user would.
 *
 * Run with:
 *   VITE_DEMO_MODE=true npm run dev   # in one terminal
 *   npm run test:e2e                 # in another
 */

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  webServer: {
    command: 'VITE_DEMO_MODE=true npm run dev',
    url: 'http://localhost:5173',
    reuseExistingService: !process.env.CI,
    timeout: 60000,
  },
});