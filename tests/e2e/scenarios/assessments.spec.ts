import { test, expect } from '@playwright/test';

test.describe('Assessment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display available tests based on tier', async ({ page }) => {
    // Navigate to assessments page
    await page.goto('/assessments');

    // Verify tests are displayed
    await expect(page.locator('[data-testid="test-list"]')).toBeVisible();

    // For Free tier, should show 3 tests
    const testItems = await page.locator('[data-testid="test-item"]').count();
    expect(testItems).toBe(3);
  });

  test('should start assessment test', async ({ page }) => {
    // Navigate to assessments page
    await page.goto('/assessments');

    // Click on first test
    await page.click('[data-testid="test-item"]:first-child');

    // Verify test instructions are displayed
    await expect(page.locator('[data-testid="test-instructions"]')).toBeVisible();

    // Click "Start Recording"
    await page.click('button[data-testid="start-recording"]');

    // Verify camera is activated
    await expect(page.locator('video[data-testid="camera-preview"]')).toBeVisible();
  });

  test('should record test video', async ({ page }) => {
    // Navigate to test page
    await page.goto('/assessments/1');

    // Start recording
    await page.click('button[data-testid="start-recording"]');

    // Wait for camera to activate
    await expect(page.locator('video[data-testid="camera-preview"]')).toBeVisible();

    // Verify timer is displayed
    await expect(page.locator('[data-testid="recording-timer"]')).toBeVisible();

    // Stop recording (after a short delay)
    await page.waitForTimeout(2000);
    await page.click('button[data-testid="stop-recording"]');

    // Verify video preview is displayed
    await expect(page.locator('video[data-testid="video-preview"]')).toBeVisible();
  });

  test('should enforce 3 attempts per day limit', async ({ page }) => {
    // Navigate to test page
    await page.goto('/assessments/1');

    // Attempt to record 4 times (should fail on 4th)
    for (let i = 1; i <= 3; i++) {
      await page.click('button[data-testid="start-recording"]');
      await page.waitForTimeout(1000);
      await page.click('button[data-testid="stop-recording"]');
      await page.click('button[data-testid="retry-recording"]');
    }

    // 4th attempt should be blocked
    await page.click('button[data-testid="start-recording"]');
    await expect(page.locator('[data-testid="attempt-limit-error"]')).toBeVisible();
  });

  test('should submit test video', async ({ page }) => {
    // Navigate to test page
    await page.goto('/assessments/1');

    // Start and stop recording
    await page.click('button[data-testid="start-recording"]');
    await page.waitForTimeout(2000);
    await page.click('button[data-testid="stop-recording"]');

    // Submit video
    await page.click('button[data-testid="submit-video"]');

    // Verify upload progress
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();

    // Wait for processing
    await expect(page.locator('[data-testid="processing-status"]')).toBeVisible();
  });

  test('should display assessment results', async ({ page }) => {
    // Navigate to completed assessment
    await page.goto('/assessments/1/results');

    // Verify results are displayed
    await expect(page.locator('[data-testid="assessment-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="problem-areas"]')).toBeVisible();

    // Verify score is between 0-100
    const scoreText = await page.textContent('[data-testid="assessment-score"]');
    const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('should enforce monthly test limit for Free tier', async ({ page }) => {
    // Navigate to assessments page
    await page.goto('/assessments');

    // Complete 3 tests (Free tier limit)
    for (let i = 1; i <= 3; i++) {
      await page.goto(`/assessments/${i}`);
      await page.click('button[data-testid="start-recording"]');
      await page.waitForTimeout(1000);
      await page.click('button[data-testid="stop-recording"]');
      await page.click('button[data-testid="submit-video"]');
      await page.waitForTimeout(2000);
    }

    // Try to start 4th test (should be blocked)
    await page.goto('/assessments/4');
    await expect(page.locator('[data-testid="monthly-limit-error"]')).toBeVisible();
  });
});







