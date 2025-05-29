// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

// Default to Vite's dev server port if process.env.BASE_URL is not set
const baseURL = process.env.BASE_URL || 'http://localhost:5173';

export default defineConfig({
  // Directory where the E2E test files are located
  testDir: './e2e',
  
  // Whether to run tests in parallel (defaults to true)
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: 'html', // Generates an HTML report
  
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: baseURL,

    // Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer
    trace: 'on-first-retry',
    
    // Default viewport size
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Example for mobile testing (optional, can be added later)
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Example of how to set up a web server if your app needs to be started before tests run
  // webServer: {
  //   command: 'npm run dev', // Or whatever command starts your dev server
  //   url: baseURL,
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000, // 2 minutes
  //   stdout: 'pipe',
  //   stderr: 'pipe',
  // },
});
