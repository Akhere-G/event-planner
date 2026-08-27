import { test, expect } from "@playwright/test";

import {
  mockAuthCheck,
  mockSuccessfulRegistration,
  mockRegistrationValidationError,
  mockRegistrationServerError,
} from "./helpers/auth";

import { register, expectRegisterPage } from "./helpers/register";

test.describe("Register", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthCheck(page, false);
  });

  test("displays the registration page", async ({ page }) => {
    await page.goto("/register");

    await expectRegisterPage(page);
  });

  test("prevents registration when terms and conditions are not accepted", async ({
    page,
  }) => {
    await mockSuccessfulRegistration(page);

    await page.goto("/register");

    await register(page, {
      acceptTerms: false,
    });

    await expect(
      page.getByText(
        "Please agree to the Terms and Conditions and Privacy Policy before registering.",
      ),
    ).toBeVisible();

    await expect(page).toHaveURL(/\/register/);
  });

  test("displays validation error when passwords do not match", async ({
    page,
  }) => {
    await page.goto("/register");

    await register(page, {
      password: "Password123!",
      repeatPassword: "DifferentPassword123!",
    });

    await expect(page.getByText(/passwords.*match/i)).toBeVisible();

    await expect(page).toHaveURL(/\/register/);
  });

  test("allows user to register with valid details", async ({ page }) => {
    await mockSuccessfulRegistration(page);

    await page.goto("/register");

    await register(page);

    await expect(page).not.toHaveURL(/\/register/);
  });

  test("submits the email address in lowercase", async ({ page }) => {
    let requestBody: Record<string, unknown> | undefined;

    await page.route("**/api/auth/register", async (route) => {
      requestBody = route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Successfully registered an account.",
          data: {
            userId: 1,
          },
        }),
      });
    });

    await page.goto("/register");

    await register(page, {
      email: "TEST@EXAMPLE.COM",
    });

    expect(requestBody?.email).toBe("test@example.com");
  });

  test("displays server validation errors", async ({ page }) => {
    await mockRegistrationValidationError(page, {
      username: ["Username already exists."],
    });

    await page.goto("/register");

    await register(page);

    await expect(page.getByText("Username already exists.")).toBeVisible();

    await expect(page).toHaveURL(/\/register/);
  });

  test("displays generic error when registration fails unexpectedly", async ({
    page,
  }) => {
    await mockRegistrationServerError(page);

    await page.goto("/register");

    await register(page);

    await expect(
      page.getByText("Sorry! Something went wrong..."),
    ).toBeVisible();

    await expect(page).toHaveURL(/\/register/);
  });

  test("allows user to navigate to the login page", async ({ page }) => {
    await page.goto("/register");

    await page
      .getByRole("link", {
        name: "Have an account? Login.",
      })
      .click();

    await expect(page).toHaveURL(/\/login/);
  });

  test("provides links to the terms and privacy pages", async ({ page }) => {
    await page.goto("/register");

    await expect(
      page.getByRole("link", {
        name: "Terms and Conditions",
      }),
    ).toHaveAttribute("href", "/terms");

    await expect(
      page.getByRole("link", {
        name: "Privacy Policy",
      }),
    ).toHaveAttribute("href", "/privacy");
  });
});
