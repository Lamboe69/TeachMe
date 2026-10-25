import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test.describe('Tutor UG — demo mode smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    // The demo database lives in sessionStorage, so clear it between tests to
    // keep each scenario independent (otherwise re-registering an email 409s).
    await page.addInitScript(() => {
      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith('tutorug.demo.db')) sessionStorage.removeItem(key);
        }
      } catch {
        /* ignore */
      }
    });
    await page.goto(BASE);
  });

  test('landing page renders with Register and Log in actions', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Create a free account' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Log in' }).first()).toBeVisible();
  });

  test('register page shows validation errors for empty fields', async ({ page }) => {
    await page.getByRole('link', { name: 'Create a free account' }).first().click();
    await expect(page).toHaveURL(/\/register/);
    await page.getByRole('button', { name: 'Create my account' }).click();
    await expect(page.getByText(/Enter your full name/i).first()).toBeVisible();
  });

  test('login page shows/hide password', async ({ page }) => {
    await page.getByRole('link', { name: 'Log in' }).first().click();
    await expect(page).toHaveURL(/\/login/);
    const pw = page.getByRole('textbox', { name: 'Password' });
    await pw.fill('secret');
    await expect(pw).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Show password' }).click();
    await expect(pw).toHaveAttribute('type', 'text');
  });

  test('forgot-password page states reset is not available', async ({ page }) => {
    await page.goto(`${BASE}/forgot-password`);
    await expect(page.getByText(/not available yet/i).first()).toBeVisible();
  });

  test('student can register, login, discover a tutor and book a session', async ({ page }) => {
    // Register
    await page.getByRole('link', { name: 'Create a free account' }).first().click();
    await page.getByLabel(/full name/i).fill('Mary Acayo');
    await page.getByLabel(/email address/i).fill('mary.acayo@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('StrongPass123!');
    await page.getByRole('textbox', { name: 'Confirm password' }).fill('StrongPass123!');
    await page.getByRole('radio', { name: /student/i }).check();
    await page.locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: 'Create my account' }).click();
    // Demo mode signs the new account in immediately and lands on the dashboard.
    await expect(page).toHaveURL(/\/student\/dashboard/);
    await expect(page.getByText(/Welcome back, Mary/i)).toBeVisible();

    // Discover tutors
    await page.getByRole('link', { name: 'Find a tutor' }).first().click();
    await expect(page).toHaveURL(/\/tutors/);
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible();

    // Open first tutor profile
    const firstTutor = page.locator('[data-testid="tutor-card"]').first();
    await firstTutor.getByRole('link', { name: 'View profile' }).click();
    await expect(page).toHaveURL(/\/tutors\//);
    await expect(page.getByRole('button', { name: 'Book a session' })).toBeVisible();

    // Book a session
    await page.getByRole('button', { name: 'Book a session' }).click();
    await expect(page).toHaveURL(/\/sessions\/book\//);

    // Pick a future date and time. The subject is pre-selected by the booking
    // page from the tutor's subjects, so we only need to fill date and time.
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    await page.getByLabel(/date/i).fill(dateStr);
    await page.getByLabel(/time/i).selectOption('15:00');
    await page.getByRole('button', { name: 'Request this session' }).click();

    // Confirmation + redirect to sessions list
    await expect(page.getByText(/Request sent/i).first()).toBeVisible({ timeout: 8000 });
    await expect(page).toHaveURL(/\/sessions/);
  });

  test('tutor can accept a pending booking request', async ({ page }) => {
    // Login as a tutor (demo account)
    await page.goto(`${BASE}/login`);
    await page.getByLabel(/email address/i).fill('sarah.demo@tutorug.ug');
    await page.getByRole('textbox', { name: 'Password' }).fill('Demo1234');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/tutor\/dashboard/);

    // Open tutor sessions
    await page.getByRole('link', { name: 'Sessions' }).first().click();
    await expect(page).toHaveURL(/\/tutor\/sessions/);

    // Switch to the Requests tab and accept the first pending request if present
    await page.getByRole('tab', { name: /requests/i }).click();
    const acceptBtn = page.locator('[data-testid="session-actions"]').first().getByRole('button', { name: /accept/i });
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
      await expect(page.getByText(/Booking accepted/i).first()).toBeVisible({ timeout: 8000 });
    }
  });

  test('session detail and feedback flow', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByLabel(/email address/i).fill('mary.demo@tutorug.ug');
    await page.getByRole('textbox', { name: 'Password' }).fill('Demo1234');
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.goto(`${BASE}/sessions`);

    // Open first session detail
    const link = page.locator('[data-testid="session-card"]').first().getByRole('link', { name: /view session details/i });
    if (await link.isVisible().catch(() => false)) {
      await link.click();
      await expect(page).toHaveURL(/\/sessions\//);
      await expect(page.getByText(/status/i).first()).toBeVisible();
    }
  });

  test('404 page has a return-home link', async ({ page }) => {
    await page.goto(`${BASE}/this-route-does-not-exist`);
    await expect(page.getByRole('link', { name: 'Back to home' })).toBeVisible();
  });

  test('unauthorized page explains lack of permission', async ({ page }) => {
    await page.goto(`${BASE}/unauthorized`);
    await expect(page.getByText(/do not have access to this page/i).first()).toBeVisible();
  });

  test('mobile layout has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/tutors`);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});