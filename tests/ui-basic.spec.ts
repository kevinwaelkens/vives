import { test, expect } from "@playwright/test";

test.describe("Basic UI Tests", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login");

    // Check if login form elements are present
    await expect(page.getByTestId("login-form")).toBeVisible();
    await expect(page.getByTestId("email-input")).toBeVisible();
    await expect(page.getByTestId("password-input")).toBeVisible();
    await expect(page.getByTestId("login-button")).toBeVisible();
  });

  test("should redirect to login when accessing protected routes", async ({
    page,
  }) => {
    await page.goto("/assessments");

    // Should redirect to login page
    await page.waitForURL("/login");
    await expect(page.getByTestId("login-form")).toBeVisible();
  });
});
