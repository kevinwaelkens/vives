import { test as base, expect } from "@playwright/test";

export const test = base;

// Test credentials
export const TEST_CREDENTIALS = {
  admin: {
    email: "test-admin@vives.com",
    password: "test123",
  },
  tutor: {
    email: "test-tutor@vives.com",
    password: "test123",
  },
};

// Helper function to login as admin
export async function loginAsAdmin(page: any) {
  await page.goto("/login");
  await page.getByTestId("email-input").fill(TEST_CREDENTIALS.admin.email);
  await page
    .getByTestId("password-input")
    .fill(TEST_CREDENTIALS.admin.password);
  await page.getByTestId("login-button").click();

  // Wait for redirect to dashboard
  await page.waitForURL("/dashboard");
}

// Helper function to login as tutor
export async function loginAsTutor(page: any) {
  await page.goto("/login");
  await page.getByTestId("email-input").fill(TEST_CREDENTIALS.tutor.email);
  await page
    .getByTestId("password-input")
    .fill(TEST_CREDENTIALS.tutor.password);
  await page.getByTestId("login-button").click();

  // Wait for redirect to dashboard
  await page.waitForURL("/dashboard");
}

export { expect };
