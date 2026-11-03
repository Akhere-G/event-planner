import { test, expect, type Page } from "@playwright/test";
import { mockAuthCheck } from "./helpers/auth";

interface MockFlight {
  id: number;
  [key: string]: unknown;
}

const trip = {
  id: 1,
  name: "Summer Vacation in Paris",
  destination: "Paris, France",
  latitude: 48.8566,
  longitude: 2.3522,
  timezone: "Europe/Paris",
  startDate: "2026-08-01",
  endDate: "2026-08-05",
  description: "Sightseeing",
  role: "admin",
  events: [],
  invites: [],
  userMemberships: [
    { id: 1, username: "testuser", email: "test@example.com", role: "admin" },
  ],
  createdAt: "2026-07-01T00:00:00Z",
  anonymousAccessCode: null,
};

async function mockTripAndFlights(page: Page) {
  const flights: MockFlight[] = [];
  let nextId = 1;
  const created: unknown[] = [];

  const json = (data: unknown, status = 200) => ({
    status,
    contentType: "application/json",
    body: JSON.stringify({ success: true, message: "ok", data }),
  });

  await page.route("**/api/itineraries/1", (route) =>
    route.fulfill(json(trip)),
  );
  await page.route("**/api/itineraries/1/accommodations", (route) =>
    route.fulfill(json([])),
  );
  await page.route("**/api/itineraries/1/flights", async (route) => {
    if (route.request().method() === "POST") {
      const body = route.request().postDataJSON();
      created.push(body);
      const flight = { id: nextId++, itineraryId: 1, ...body };
      flights.push(flight);
      await route.fulfill(json(flight, 201));
      return;
    }
    await route.fulfill(json(flights));
  });
  await page.route("**/api/itineraries/1/flights/*", async (route) => {
    const id = Number(route.request().url().split("/").pop());
    if (route.request().method() === "DELETE") {
      flights.splice(
        flights.findIndex((f) => f.id === id),
        1,
      );
      await route.fulfill(json({ deletedId: id }));
      return;
    }
    await route.fallback();
  });

  return { created };
}

test.describe("Flights", () => {
  test("adds a flight, shows it on its day and in the list, then deletes it", async ({
    page,
  }) => {
    await mockAuthCheck(page, true);
    const { created } = await mockTripAndFlights(page);

    await page.goto("/trips/1");
    await page.getByRole("button", { name: "Flights" }).click();
    await page.getByRole("button", { name: "Add flight" }).click();

    const form = page.getByRole("form", { name: "New flight" });
    await form.getByLabel("Airline").fill("British Airways");
    await form.getByLabel("Flight number").fill("BA117");
    await form.getByLabel("Airport (IATA)").first().fill("LHR");
    await form.getByLabel("Airport (IATA)").last().fill("CDG");
    await form.getByLabel("Timezone").first().fill("Europe/London");
    await form.getByLabel("Timezone").last().fill("Europe/Paris");
    await form.getByLabel("Departs (local time)").fill("2026-08-01T10:00");
    await form.getByLabel("Arrives (local time)").fill("2026-08-01T12:20");
    await form.getByRole("button", { name: "Add Flight" }).click();

    await expect(page.getByText("Flight added!")).toBeVisible();

    // The request carries airport-local times converted to UTC.
    expect(created[0]).toMatchObject({
      flightNumber: "BA117",
      departAt: "2026-08-01T09:00:00.000Z",
      arriveAt: "2026-08-01T10:20:00.000Z",
    });

    const card = page.getByTestId("flight-card");
    await expect(card).toContainText("BA117 · British Airways");
    await expect(card).toContainText("LHR");

    // The day card for 1 Aug lists the flight too.
    await expect(
      page.getByRole("list", { name: "Flights" }).first(),
    ).toContainText("BA117 LHR → CDG");

    await card.getByRole("button", { name: "Flight actions" }).click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete Flight" }).click();
    await expect(page.getByText("Flight deleted.")).toBeVisible();
    await expect(page.getByTestId("flight-card")).toHaveCount(0);
  });

  test("rejects arrival before departure without calling the API", async ({
    page,
  }) => {
    await mockAuthCheck(page, true);
    const { created } = await mockTripAndFlights(page);

    await page.goto("/trips/1");
    await page.getByRole("button", { name: "Flights" }).click();
    await page.getByRole("button", { name: "Add flight" }).click();

    const form = page.getByRole("form", { name: "New flight" });
    await form.getByLabel("Airline").fill("British Airways");
    await form.getByLabel("Flight number").fill("BA117");
    await form.getByLabel("Airport (IATA)").first().fill("LHR");
    await form.getByLabel("Airport (IATA)").last().fill("CDG");
    await form.getByLabel("Timezone").first().fill("Europe/London");
    await form.getByLabel("Timezone").last().fill("Europe/Paris");
    await form.getByLabel("Departs (local time)").fill("2026-08-01T10:00");
    await form.getByLabel("Arrives (local time)").fill("2026-08-01T08:00");
    await form.getByRole("button", { name: "Add Flight" }).click();

    await expect(
      form.getByText("Arrival must be after departure."),
    ).toBeVisible();
    expect(created).toHaveLength(0);
  });
});
