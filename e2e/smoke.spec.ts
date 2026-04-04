import { test, expect } from "@playwright/test";

test.describe("ColorArchive Smoke Tests", () => {
  test("homepage loads with color grid", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ColorArchive/);
    await expect(page.locator("header")).toBeVisible();
  });

  test("color detail page renders", async ({ page }) => {
    await page.goto("/colors/cobalt-core-vivid/");
    await expect(page).toHaveTitle(/Cobalt Core Vivid/i);
  });

  test("all colors page loads with filters", async ({ page }) => {
    await page.goto("/all-colors/");
    await expect(page).toHaveTitle(/All Colors/i);
  });

  test("collections page loads", async ({ page }) => {
    await page.goto("/collections/");
    await expect(page).toHaveTitle(/Collections/i);
  });

  test("pro page loads with pricing", async ({ page }) => {
    await page.goto("/pro/");
    await expect(page).toHaveTitle(/Pro/i);
  });

  test("search page responds to query", async ({ page }) => {
    await page.goto("/search/?q=ocean");
    await expect(page).toHaveTitle(/Search/i);
  });

  test("color converter tool loads", async ({ page }) => {
    await page.goto("/convert/");
    await expect(page).toHaveTitle(/Convert/i);
  });

  test("contrast checker tool loads", async ({ page }) => {
    await page.goto("/contrast/");
    await expect(page).toHaveTitle(/Contrast/i);
  });

  test("privacy policy page loads", async ({ page }) => {
    await page.goto("/privacy/");
    await expect(page).toHaveTitle(/Privacy/i);
  });

  test("terms page loads", async ({ page }) => {
    await page.goto("/terms/");
    await expect(page).toHaveTitle(/Terms/i);
  });
});
