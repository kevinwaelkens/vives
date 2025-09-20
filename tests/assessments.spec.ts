import { test, expect, loginAsAdmin } from "./setup";

test.describe("Assessments Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/assessments");
  });

  test("should display assessments page correctly", async ({ page }) => {
    // Check page title and elements
    await expect(page.getByText("Assessments")).toBeVisible();
    await expect(
      page.getByText("Grade student submissions and provide feedback"),
    ).toBeVisible();

    // Check stats cards
    await expect(page.getByText("Total")).toBeVisible();
    await expect(page.getByText("Graded")).toBeVisible();
    await expect(page.getByText("Pending")).toBeVisible();
    await expect(page.getByText("Late")).toBeVisible();
    await expect(page.getByText("Missing")).toBeVisible();
  });

  test("should display filter tabs", async ({ page }) => {
    // Check filter buttons
    await expect(page.getByText("All")).toBeVisible();
    await expect(page.getByText("To Grade")).toBeVisible();
    await expect(page.getByText("Graded")).toBeVisible();
    await expect(page.getByText("Not Submitted")).toBeVisible();
  });

  test("should open grading dialog when clicking grade button", async ({
    page,
  }) => {
    // Look for a grade button (if any assessments exist)
    const gradeButton = page.getByTestId("grade-assessment-button").first();

    // Check if there are any assessments to grade
    if (await gradeButton.isVisible()) {
      await gradeButton.click();

      // Dialog should open
      await expect(page.getByText("Grade Assessment")).toBeVisible();
      await expect(page.getByTestId("grading-form")).toBeVisible();
      await expect(page.getByTestId("score-input")).toBeVisible();
      await expect(page.getByTestId("grade-select")).toBeVisible();
      await expect(page.getByTestId("feedback-textarea")).toBeVisible();
      await expect(page.getByTestId("submit-grade-button")).toBeVisible();
      await expect(page.getByTestId("cancel-grade-button")).toBeVisible();
    }
  });

  test("should close grading dialog when clicking cancel", async ({ page }) => {
    // Look for a grade button (if any assessments exist)
    const gradeButton = page.getByTestId("grade-assessment-button").first();

    if (await gradeButton.isVisible()) {
      await gradeButton.click();

      // Dialog should be open
      await expect(page.getByText("Grade Assessment")).toBeVisible();

      // Click cancel
      await page.getByTestId("cancel-grade-button").click();

      // Dialog should be closed
      await expect(page.getByText("Grade Assessment")).not.toBeVisible();
    }
  });

  test("should show competence assessment tab", async ({ page }) => {
    // Look for a grade button (if any assessments exist)
    const gradeButton = page.getByTestId("grade-assessment-button").first();

    if (await gradeButton.isVisible()) {
      await gradeButton.click();

      // Check tabs are present
      await expect(page.getByText("Traditional Grading")).toBeVisible();
      await expect(page.getByText("STEAM/CT Competences")).toBeVisible();

      // Click on competence tab
      await page.getByText("STEAM/CT Competences").click();

      // Should show competence assessment component
      await expect(
        page.getByTestId("submit-competence-grade-button"),
      ).toBeVisible();
      await expect(
        page.getByTestId("cancel-competence-grade-button"),
      ).toBeVisible();
    }
  });

  test("should filter assessments by status", async ({ page }) => {
    // Click on "To Grade" filter
    await page.getByText("To Grade").click();

    // Wait for any potential loading
    await page.waitForTimeout(500);

    // The table should still be visible (even if empty)
    await expect(page.getByText("All Assessments")).toBeVisible();
  });
});
