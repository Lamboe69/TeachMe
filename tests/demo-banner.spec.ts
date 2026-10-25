import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test('demo banner is visible in default (demo) mode', async ({ page }) => {
  await page.goto(BASE);
  await expect(page.getByText(/Demo mode — showing sample data/i).first()).toBeVisible();
});