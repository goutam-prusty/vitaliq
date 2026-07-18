import { test, expect } from "@playwright/test";

test.describe("Vitaliq Primary E2E User Journey", () => {
  test("successfully runs the main application flows", async ({ page }) => {
    // 1. Visit Landing Page
    await page.goto("/landing");
    await expect(page.locator("h1")).toContainText("Health analytics");
    
    // 2. Navigate to Dashboard
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toContainText("Overview");
    
    // 3. Verify Targets section is visible
    await expect(page.locator("h2:has-text('Targets')")).toBeVisible();
    
    // 4. Click log reading trigger
    const logButton = page.locator("button:has-text('Log reading'), a[href='/log']").first();
    await expect(logButton).toBeVisible();
    await logButton.click();
    
    // Check that the global log drawer modal dialog is visible!
    await expect(page.locator("role=dialog[name='Log Health Entry']")).toBeVisible();
    await page.locator("button[aria-label='Close logging panel'], button:has-text('Close logging panel')").click();
    
    // 5. Navigate to Trends page
    await page.goto("/trends");
    await expect(page.locator("h1")).toContainText("Trends");
    
    // 6. Navigate to History page
    await page.goto("/history");
    await expect(page.locator("h1")).toContainText("History");
    
    // 7. Navigate to Settings page
    await page.goto("/settings");
    await expect(page.locator("h1")).toContainText("Settings");
  });
});
