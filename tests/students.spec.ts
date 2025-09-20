import { test, expect, loginAsAdmin } from "./setup";

test.describe("Students Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/students");
  });

  test("should display students page correctly", async ({ page }) => {
    // Check page title and elements
    await expect(page.getByText("Students")).toBeVisible();
    await expect(
      page.getByText("Manage student records and information"),
    ).toBeVisible();
    await expect(page.getByTestId("add-student-button")).toBeVisible();
    await expect(page.getByTestId("search-students-input")).toBeVisible();
  });

  test("should display existing students from seed data", async ({ page }) => {
    // Should show test students from seed data
    await expect(page.getByText("Test Student 1")).toBeVisible();
    await expect(page.getByText("Test Student 2")).toBeVisible();
    await expect(page.getByText("Test Student 3")).toBeVisible();
  });

  test("should search students", async ({ page }) => {
    // Search for a specific student
    await page.getByTestId("search-students-input").fill("Test Student 1");

    // Should show only matching student
    await expect(page.getByText("Test Student 1")).toBeVisible();
    await expect(page.getByText("Test Student 2")).not.toBeVisible();

    // Clear search
    await page.getByTestId("search-students-input").clear();

    // Should show all students again
    await expect(page.getByText("Test Student 1")).toBeVisible();
    await expect(page.getByText("Test Student 2")).toBeVisible();
  });

  test("should open add student form", async ({ page }) => {
    await page.getByTestId("add-student-button").click();

    // Form should be visible
    await expect(page.getByTestId("student-form")).toBeVisible();
    await expect(page.getByText("Add New Student")).toBeVisible();
    await expect(page.getByTestId("student-name-input")).toBeVisible();
    await expect(page.getByTestId("student-email-input")).toBeVisible();
    await expect(page.getByTestId("submit-student-button")).toBeVisible();
    await expect(page.getByTestId("cancel-student-button")).toBeVisible();
  });

  test("should cancel add student form", async ({ page }) => {
    await page.getByTestId("add-student-button").click();
    await expect(page.getByTestId("student-form")).toBeVisible();

    await page.getByTestId("cancel-student-button").click();

    // Form should be hidden
    await expect(page.getByTestId("student-form")).not.toBeVisible();
  });

  test("should create a new student", async ({ page }) => {
    await page.getByTestId("add-student-button").click();

    // Fill in student details
    await page.getByTestId("student-name-input").fill("New Test Student");
    await page.getByTestId("student-email-input").fill("newstudent@vives.com");

    // Select a group (assuming the first option is available)
    await page.locator("#groupId").selectOption({ index: 1 });

    // Submit form
    await page.getByTestId("submit-student-button").click();

    // Should redirect back to students list and show new student
    await expect(page.getByTestId("student-form")).not.toBeVisible();
    await expect(page.getByText("New Test Student")).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    await page.getByTestId("add-student-button").click();

    // Try to submit empty form
    await page.getByTestId("submit-student-button").click();

    // Form should still be visible (validation prevents submission)
    await expect(page.getByTestId("student-form")).toBeVisible();
  });

  test("should validate email format", async ({ page }) => {
    await page.getByTestId("add-student-button").click();

    // Fill in invalid email
    await page.getByTestId("student-name-input").fill("Test Student");
    await page.getByTestId("student-email-input").fill("invalid-email");

    // Try to submit
    await page.getByTestId("submit-student-button").click();

    // Form should still be visible due to email validation
    await expect(page.getByTestId("student-form")).toBeVisible();
  });
});
