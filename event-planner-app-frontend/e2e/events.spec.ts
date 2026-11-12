import { test, expect, type Page } from "@playwright/test";
import {
  buildTrip,
  json,
  mockApiDefaults,
  mockAuth,
  mockTrip,
} from "./helpers/api";

const events = () => [
  {
    id: 11,
    name: "Louvre visit",
    address: "Rue de Rivoli, Paris",
    latitude: 48.86,
    longitude: 2.33,
    startAt: "2026-08-01T07:30:00Z",
    endAt: "2026-08-01T10:00:00Z",
    category: "general",
    description: null,
  },
  {
    id: 12,
    name: "Seine dinner cruise",
    address: "Port de la Bourdonnais, Paris",
    latitude: 48.86,
    longitude: 2.29,
    startAt: "2026-08-01T17:00:00Z",
    endAt: "2026-08-01T19:00:00Z",
    category: "general",
    description: null,
  },
];

const eventCard = (page: Page, name: string) =>
  page.getByTestId("event-card").filter({ hasText: name });

async function openTrip(page: Page, role: string) {
  const stored = events();
  const deleted: number[] = [];

  await mockApiDefaults(page);
  await mockAuth(page, { signedIn: true });
  await mockTrip(page, buildTrip({ role }));
  await page.route("**/api/itineraries/1/events", (route) =>
    route.fulfill(json({ events: stored })),
  );
  await page.route("**/api/itineraries/1/events/*", (route) => {
    const id = Number(route.request().url().split("/").pop());
    deleted.push(id);
    stored.splice(
      stored.findIndex((event) => event.id === id),
      1,
    );
    return route.fulfill(json({ deletedId: id }));
  });

  await page.goto("/trips/1");
  return { deleted };
}

test.describe("Trip events", () => {
  test("an editor sees events at their local time and can delete one", async ({
    page,
  }) => {
    const { deleted } = await openTrip(page, "editor");

    const louvre = eventCard(page, "Louvre visit");
    await expect(louvre).toContainText("9:30 AM");
    await expect(louvre).toContainText("12:00 PM");
    await expect(eventCard(page, "Seine dinner cruise")).toBeVisible();

    await louvre.getByRole("button", { expanded: false }).first().click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await page
      .getByRole("dialog", { name: "Delete 'Louvre visit'" })
      .getByRole("button", { name: "Delete" })
      .click();

    await expect(page.getByText("Event deleted!")).toBeVisible();
    await expect(eventCard(page, "Louvre visit")).toHaveCount(0);
    await expect(eventCard(page, "Seine dinner cruise")).toBeVisible();
    expect(deleted).toEqual([11]);
  });

  test("a viewer can read events but is given no way to change them", async ({
    page,
  }) => {
    await openTrip(page, "viewer");

    const louvre = eventCard(page, "Louvre visit");
    await expect(louvre).toContainText("9:30 AM");
    await expect(page.getByTitle("Change event times")).toHaveCount(0);

    await louvre.getByRole("button", { expanded: false }).first().click();
    await expect(
      page.getByRole("menuitem", { name: "Copy Address" }),
    ).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Delete" })).toHaveCount(0);
    await expect(page.getByRole("menuitem", { name: "Edit" })).toHaveCount(0);
  });
});
