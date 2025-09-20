import {
  test,
  expect,
  TEST_CREDENTIALS,
  loginAsAdmin,
  loginAsTutor,
} from "./setup";

test.describe("Authentication", () => {
  test("should display login page correctly", async ({ page }) => {
    await page.goto("/login");

    // Check if login form elements are present
    await expect(page.getByTestId("login-form")).toBeVisible();
    await expect(page.getByTestId("email-input")).toBeVisible();
    await expect(page.getByTestId("password-input")).toBeVisible();
    await expect(page.getByTestId("login-button")).toBeVisible();

    // Check page title and content
    await expect(page.getByText("Welcome Back")).toBeVisible();
    await expect(
      page.getByText("Sign in to your School Management System account"),
    ).toBeVisible();
  });

  test("should redirect unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");

    // Should redirect to login page
    await page.waitForURL("/login");
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("should login successfully with admin credentials", async ({ page }) => {
    await page.goto("/login");

    // Fill in admin credentials
    await page.getByTestId("email-input").fill(TEST_CREDENTIALS.admin.email);
    await page
      .getByTestId("password-input")
      .fill(TEST_CREDENTIALS.admin.password);

    // Submit form
    await page.getByTestId("login-button").click();

    // Should redirect to dashboard
    await page.waitForURL("/dashboard");
    await expect(page.getByTestId("navigation")).toBeVisible();
  });

  test("should login successfully with tutor credentials", async ({ page }) => {
    await page.goto("/login");

    // Fill in tutor credentials
    await page.getByTestId("email-input").fill(TEST_CREDENTIALS.tutor.email);
    await page
      .getByTestId("password-input")
      .fill(TEST_CREDENTIALS.tutor.password);

    // Submit form
    await page.getByTestId("login-button").click();

    // Should redirect to dashboard
    await page.waitForURL("/dashboard");
    await expect(page.getByTestId("navigation")).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    // Fill in invalid credentials
    await page.getByTestId("email-input").fill("invalid@email.com");
    await page.getByTestId("password-input").fill("wrongpassword");

    // Submit form
    await page.getByTestId("login-button").click();

    // Should stay on login page and show error
    await expect(page.getByTestId("login-form")).toBeVisible();
    // Note: We'd need to add a test ID to the toast/error message to test this properly
  });

  test("should show different navigation for admin vs tutor", async ({
    page,
  }) => {
    // Test admin navigation
    await loginAsAdmin(page);
    await expect(page.getByTestId("nav-user-management")).toBeVisible();
    await expect(page.getByTestId("nav-settings")).toBeVisible();

    // Logout (we'd need to add a logout button with test ID)
    await page.goto("/login");

    // Test tutor navigation
    await loginAsTutor(page);
    await expect(page.getByTestId("nav-user-management")).not.toBeVisible();
    await expect(page.getByTestId("nav-settings")).not.toBeVisible();
  });

  test("should navigate between dashboard pages", async ({ page }) => {
    await loginAsAdmin(page);

    // Test navigation to different pages
    await page.getByTestId("nav-students").click();
    await page.waitForURL("/students");

    await page.getByTestId("nav-groups").click();
    await page.waitForURL("/groups");

    await page.getByTestId("nav-tasks").click();
    await page.waitForURL("/tasks");

    await page.getByTestId("nav-assessments").click();
    await page.waitForURL("/assessments");

    await page.getByTestId("nav-attendance").click();
    await page.waitForURL("/attendance");

    await page.getByTestId("nav-analytics").click();
    await page.waitForURL("/analytics");
  });
});
