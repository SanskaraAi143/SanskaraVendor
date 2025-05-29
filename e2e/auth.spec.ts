import { test, expect } from '@playwright/test';

test.describe('Vendor Authentication', () => {
  test('should allow a vendor to log in and reach the dashboard', async ({ page }) => {
    // 1. Navigate to the login page
    // The baseURL is configured in playwright.config.ts, so /login should be correct.
    await page.goto('/login');

    // Wait for the login tab to be active and form to be potentially loaded
    // Assuming 'login' tab is active by default, or ensure it is.
    // await page.click('button[role="tab"]:has-text("Login")'); // If needed

    // 2. Fill in credentials
    // Using specific placeholders or labels if available can be more robust.
    // From LoginPage.tsx, email input has placeholder "vendor@example.com"
    await page.fill('input[type="email"]', 'testvendor@example.com');
    // Password input is of type password
    await page.fill('input[type="password"]', 'password123');
    
    // 3. Click the login button
    // From LoginPage.tsx, the button text is "Sign In"
    await page.click('button[type="submit"]:has-text("Sign In")');

    // 4. Wait for navigation to the dashboard page and assert URL
    // Assuming successful login navigates to '/' which is the dashboard
    // Increased timeout for URL change, as network requests for auth and data loading can take time.
    await page.waitForURL('/', { timeout: 15000 }); 
    expect(page.url()).toMatch(/\/$/); // Checks if URL ends with '/'

    // 5. Assert that a key element of the dashboard is visible
    // From Dashboard.tsx, the welcome message is "Welcome, {vendorName}!"
    // Using a role selector with a partial text match for the name.
    const welcomeHeading = page.getByRole('heading', { name: /Welcome,/i });
    await expect(welcomeHeading).toBeVisible({ timeout: 15000 }); // Increased timeout for visibility after navigation
  });
});
