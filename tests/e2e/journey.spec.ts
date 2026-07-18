import { test, expect } from "@playwright/test";

test.describe("Vitaliq Primary E2E User Journey", () => {
  test("successfully runs the main application flows", async ({ page }) => {
    // 1. Visit Landing Page (unauthenticated)
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Health analytics");
    
    // 2. Click Interactive Demo trigger
    const demoLink = page.locator("a:has-text('Try Interactive Demo'), a:has-text('Try Demo')").first();
    await expect(demoLink).toBeVisible();
    await demoLink.click();
    
    // 3. Confirm it redirects to Dashboard and loads Overview
    await page.waitForURL("**/dashboard");
    await expect(page.locator("h1")).toContainText("Overview");
    
    // 4. Verify Targets section is visible
    await expect(page.locator("h2:has-text('Targets')")).toBeVisible();
    
    // 5. Click log reading trigger
    const logButton = page.locator("main a[href='/log']").first();
    await expect(logButton).toBeVisible();
    await logButton.click();
    
    // Check that we navigated to the Log page
    await page.waitForURL("**/log");
    await expect(page.locator("h1")).toContainText("Log Entry");
    
    // 6. Navigate to Trends page
    await page.goto("/trends");
    await expect(page.locator("h1")).toContainText("Trends");
    
    // 7. Navigate to History page
    await page.goto("/history");
    await expect(page.locator("h1")).toContainText("History");
    
    // 8. Navigate to Settings page
    await page.goto("/settings");
    await expect(page.locator("h1")).toContainText("Settings");

    // 9. Verify logout
    const logoutBtn = page.locator("button:has-text('Sign Out')").first();
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Confirm redirected to landing page
    await page.waitForURL("**/");
    await expect(page.locator("h1")).toContainText("Health analytics");
  });
});
