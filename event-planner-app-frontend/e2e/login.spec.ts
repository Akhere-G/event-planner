import { test, expect } from "@playwright/test";

import {
  mockAuthCheck,
  mockSuccessfulLogin,
  mockFailedLogin,
} from "./helpers/auth";

import { login, expectLoginPage } from "./helpers/login";

test.describe("Login", () => {
  test("redirects unauthenticated user to login page when accessing protected route", async ({
    page,
  }) => {
    await mockAuthCheck(page, false);

    await page.goto("/");

    await expect(page).toHaveURL(/\/login/);
    await expectLoginPage(page);
  });

  test("displays error message on invalid login credentials", async ({
    page,
  }) => {
    await mockAuthCheck(page, false);
    await mockFailedLogin(page);

    await page.goto("/login");

    await login(page, {
      email: "wrong@example.com",
      password: "wrongpassword",
    });

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("Invalid credentials.")).toBeVisible();
  });

  test("allows user to log in with valid credentials and navigate to trips page", async ({
    page,
  }) => {
    await mockAuthCheck(page, false);
    await mockSuccessfulLogin(page);

    await page.goto("/login");

    await login(page);

    await expect(page).not.toHaveURL(/\/login/);
  });

  test("allows user to navigate to the register page", async ({ page }) => {
    await mockAuthCheck(page, false);

    await page.goto("/login");

    await page.getByText("New here? Create an Account.").click();

    await expect(page).toHaveURL(/\/register/);
  });
});
