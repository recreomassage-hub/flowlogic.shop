import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should complete registration and login flow', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');

    // Fill registration form
    await page.fill('input[type="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.fill('input[name="name"]', 'Test User');
    await page.check('input[name="wellness_disclaimer_accepted"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify user is on Free tier
    const tierText = await page.textContent('[data-testid="user-tier"]');
    expect(tierText).toContain('Free');
  });

  test('should display wellness disclaimer on first login', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');

    // Register new user
    await page.fill('input[type="email"]', `disclaimer-${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.fill('input[name="name"]', 'Disclaimer User');
    await page.check('input[name="wellness_disclaimer_accepted"]');
    await page.click('button[type="submit"]');

    // Wait for disclaimer modal
    await expect(page.locator('[data-testid="wellness-disclaimer-modal"]')).toBeVisible();

    // Verify disclaimer text
    const disclaimerText = await page.textContent('[data-testid="wellness-disclaimer-text"]');
    expect(disclaimerText).toContain('wellness');
    expect(disclaimerText).toContain('not a medical product');

    // Accept disclaimer
    await page.click('button[data-testid="accept-disclaimer"]');

    // Verify modal is closed
    await expect(page.locator('[data-testid="wellness-disclaimer-modal"]')).not.toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill login form
    await page.fill('input[type="email"]', 'existing@example.com');
    await page.fill('input[type="password"]', 'SecurePass123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should reject login with invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill login form with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    const errorText = await page.textContent('[data-testid="error-message"]');
    expect(errorText).toContain('Invalid email or password');
  });

  test('should validate registration form', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Verify validation errors
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="disclaimer-error"]')).toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');

    // Fill form with weak password
    await page.fill('input[type="email"]', 'weak@example.com');
    await page.fill('input[type="password"]', '123');
    await page.fill('input[name="name"]', 'Weak User');
    await page.check('input[name="wellness_disclaimer_accepted"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify password error
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    const errorText = await page.textContent('[data-testid="password-error"]');
    expect(errorText).toContain('at least 8 characters');
  });
});





