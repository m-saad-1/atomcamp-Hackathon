// Playwright E2E Stub
import { test, expect } from '@playwright/test';

test('Dashboard loads and requires authentication', async ({ page }) => {
  await page.goto('/dashboard');
  // Expect redirect to signin
  await expect(page).toHaveURL(/.*signin/);
});
