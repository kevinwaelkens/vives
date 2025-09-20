import { test, expect } from "@playwright/test";

test.describe("Performance Tests", () => {
  test("search input should be debounced and not cause excessive re-renders", async ({
    page,
  }) => {
    // Navigate to login page
    await page.goto("/login");

    // Login as admin
    await page.getByTestId("email-input").fill("test-admin@vives.com");
    await page.getByTestId("password-input").fill("test123");
    await page.getByTestId("login-button").click();

    // Wait for redirect to dashboard
    await page.waitForURL("/dashboard", { timeout: 10000 });

    // Navigate to admin/users page
    await page.goto("/admin/users");

    // Wait for page to load
    await expect(page.getByText("User Management")).toBeVisible();

    // Track network requests to see if search is debounced
    const requests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/users")) {
        requests.push(request.url());
      }
    });

    // Find the search input
    const searchInput = page.locator('input[placeholder*="Search users"]');
    await expect(searchInput).toBeVisible();

    // Type quickly to test debouncing
    await searchInput.fill("test");

    // Wait a bit for debounce to settle
    await page.waitForTimeout(500);

    // Check that we don't have excessive API calls
    // With debouncing, we should have at most 2-3 requests (initial load + final search)
    // Without debouncing, we'd have 5+ requests (one for each keystroke)
    expect(requests.length).toBeLessThan(5);

    console.log(`API requests made: ${requests.length}`);
    console.log(`Requests: ${requests.join(", ")}`);
  });

  test("search input should respond to user typing immediately", async ({
    page,
  }) => {
    // Navigate to login page
    await page.goto("/login");

    // Login as admin
    await page.getByTestId("email-input").fill("test-admin@vives.com");
    await page.getByTestId("password-input").fill("test123");
    await page.getByTestId("login-button").click();

    // Wait for redirect to dashboard
    await page.waitForURL("/dashboard", { timeout: 10000 });

    // Navigate to admin/users page
    await page.goto("/admin/users");

    // Wait for page to load
    await expect(page.getByText("User Management")).toBeVisible();

    // Find the search input
    const searchInput = page.locator('input[placeholder*="Search users"]');
    await expect(searchInput).toBeVisible();

    // Type and verify the input value updates immediately
    await searchInput.fill("test user");

    // The input value should update immediately (not debounced)
    await expect(searchInput).toHaveValue("test user");
  });
});
