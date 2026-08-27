import { Page } from "@playwright/test";

export interface MockUser {
  id: number;
  username: string;
  email: string;
}

export const defaultMockUser: MockUser = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
};

export async function mockAuthCheck(
  page: Page,
  authenticated = true,
  user: MockUser = defaultMockUser,
) {
  await page.route("**/api/auth/check", async (route) => {
    if (authenticated) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "User is authenticated.",
          data: {
            userId: user.id,
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          message: "Not authenticated.",
        }),
      });
    }
  });
}

export async function mockSuccessfulLogin(
  page: Page,
  user: MockUser = defaultMockUser,
) {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Successfully logged in",
        data: {
          userId: user.id,
        },
      }),
    });
  });
}

export async function mockFailedLogin(
  page: Page,
  message = "Invalid credentials.",
) {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        error: message,
      }),
    });
  });
}

export async function mockSuccessfulRegistration(
  page: Page,
  user: MockUser = defaultMockUser,
) {
  await page.route("**/api/auth/register", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Successfully registered an account.",
        data: {
          userId: user.id,
        },
      }),
    });
  });
}

export async function mockRegistrationValidationError(
  page: Page,
  error: string | Record<string, string[]> = "Registration failed.",
) {
  await page.route("**/api/auth/register", async (route) => {
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        error,
      }),
    });
  });
}

export async function mockRegistrationServerError(page: Page) {
  await page.route("**/api/auth/register", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        message: "Internal server error.",
      }),
    });
  });
}

export async function mockLogout(page: Page) {
  await page.route("**/api/auth/logout", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Successfully logged out.",
      }),
    });
  });
}
