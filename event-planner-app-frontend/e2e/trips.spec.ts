import { test, expect } from "@playwright/test";
import { mockGetTrips, defaultMockTrips } from "./helpers/trip";

test.describe("Trips E2E Flow", () => {
  test.beforeEach(async ({ page }) => {
    await mockGetTrips(page, defaultMockTrips);
  });

  test("redirects to trip page from login page when authenticated", async ({
    page,
  }) => {
    await page.goto("/login");

    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Trips" })).toBeVisible();
  });

  test("redirects to trip page from register page when authenticated", async ({
    page,
  }) => {
    await page.goto("/register");

    await expect(page).not.toHaveURL(/\/register/);
    await expect(page.getByRole("heading", { name: "Trips" })).toBeVisible();
  });

  test("displays list of itineraries for authenticated user", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByText("Summer Vacation in Paris").first(),
    ).toBeVisible();
    await expect(page.getByText("Tokyo Adventure").first()).toBeVisible();
  });

  test("allows navigating to trip details page", async ({ page }) => {
    await page.goto("/");

    await page.getByText("Summer Vacation in Paris").first().click();

    await expect(page).toHaveURL(/\/trips\/1/);
  });
});
