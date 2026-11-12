import { test, expect } from "@playwright/test";
import {
  buildTrip,
  json,
  mockApiDefaults,
  mockAuth,
  mockTrip,
} from "./helpers/api";

const paris = buildTrip();
const tokyo = buildTrip({
  id: 2,
  name: "Tokyo Adventure",
  destination: "Tokyo, Japan",
  role: "viewer",
});

test.describe("Trips", () => {
  test("lists the user's trips and opens one", async ({ page }) => {
    await mockApiDefaults(page);
    await mockAuth(page, { signedIn: true });
    await page.route("**/api/itineraries?*", (route) =>
      route.fulfill(json({ itineraries: [paris, tokyo], hasMore: false })),
    );
    await mockTrip(page, paris);

    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: tokyo.name, level: 3 }),
    ).toBeVisible();
    await page.getByRole("article").filter({ hasText: paris.name }).click();

    await expect(page).toHaveURL(`/trips/${paris.id}`);
    await expect(
      page.getByRole("heading", { name: paris.name }).first(),
    ).toBeVisible();
  });

  test("a user with no trips is offered a way to create one", async ({
    page,
  }) => {
    await mockApiDefaults(page);
    await mockAuth(page, { signedIn: true });
    await page.route("**/api/itineraries?*", (route) =>
      route.fulfill(json({ itineraries: [], hasMore: false })),
    );

    await page.goto("/");

    await expect(page.getByText("No trips.")).toBeVisible();
    await page.getByRole("button", { name: "Create new trip?" }).click();
    await expect(page).toHaveURL("/addtrip");
  });
});
