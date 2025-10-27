import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should redirect to magazines page', async ({ page }) => {
    await page.goto('/');
    // 홈페이지는 /magazines로 리다이렉트됩니다
    await expect(page).toHaveURL('/magazines');
  });
});

test.describe('Authentication', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('h2')).toContainText('로그인');
  });

  test('should load signup page', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('h2')).toContainText('회원가입');
  });
});

test.describe('Magazines', () => {
  test('should load magazines page', async ({ page }) => {
    await page.goto('/magazines');
    // 페이지가 로드되는지 확인
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load new magazine page', async ({ page }) => {
    await page.goto('/magazines/new');
    // 페이지가 로드되는지 확인
    await expect(page.locator('body')).toBeVisible();
  });
});
