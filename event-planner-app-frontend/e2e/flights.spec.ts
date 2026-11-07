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

const airport = (code: string, name: string, timezone: string) => ({
  code,
  name,
  latitude: 0,
  longitude: 0,
  timezone,
});

const places = {
  paris: {
    label: "Paris, FR",
    distanceKm: 14,
    airports: [
      airport("CDG", "Charles de Gaulle Airport", "Europe/Paris"),
      airport("ORY", "Orly Airport", "Europe/Paris"),
    ],
  },
  london: {
    label: "London, GB",
    distanceKm: 340,
    airports: [airport("LHR", "Heathrow Airport", "Europe/London")],
  },
};

const offer = {
  airline: "BA",
  flightNumber: "304",
  departureAirport: "LHR",
  arrivalAirport: "CDG",
  departureTimezone: "Europe/London",
  arrivalTimezone: "Europe/Paris",
  departAt: "2026-08-01T09:00:00Z",
  arriveAt: "2026-08-01T10:20:00Z",
  durationMinutes: 80,
  price: 120,
};

const savedFlight = {
  id: 1,
  itineraryId: 1,
  airline: "BA",
  flightNumber: "304",
  departureAirport: "LHR",
  arrivalAirport: "CDG",
  departureTimezone: "Europe/London",
  arrivalTimezone: "Europe/Paris",
  departureLatitude: 51.47,
  departureLongitude: -0.4543,
  arrivalLatitude: 49.0097,
  arrivalLongitude: 2.5479,
  departAt: "2026-08-01T09:00:00Z",
  arriveAt: "2026-08-01T10:20:00Z",
  notes: null,
};

async function mockTripAndFlights(
  page: Page,
  initialFlights: MockFlight[] = [],
) {
  const flights = [...initialFlights];
  const created: unknown[] = [];
  const searches: string[] = [];

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
      created.push(route.request().postDataJSON());
      flights.push(savedFlight);
      await route.fulfill(json(savedFlight, 201));
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
  await page.route("**/api/itineraries/1/flights/airports*", (route) => {
    const q = new URL(route.request().url()).searchParams.get("q") ?? "";
    const matches = Object.entries(places)
      .filter(([key]) => key.startsWith(q.toLowerCase()))
      .map(([, place]) => place);
    return route.fulfill(json(matches));
  });
  await page.route("**/api/itineraries/1/flights/search*", (route) => {
    searches.push(new URL(route.request().url()).search);
    return route.fulfill(json([offer]));
  });

  return { created, searches };
}

test.describe("Flights", () => {
  test("searches for a flight, saves it, and shows it on its day", async ({
    page,
  }) => {
    await mockAuthCheck(page, true);
    const { created, searches } = await mockTripAndFlights(page);

    await page.goto("/trips/1");
    await page.getByRole("button", { name: "Flights" }).click();
    await page.getByRole("button", { name: "Search for a flight" }).click();

    const form = page.getByRole("form", { name: "Search flights" });
    await expect(form.getByLabel("Arriving at")).toHaveValue("Paris, FR");

    await form.getByLabel("Departing from").fill("lon");
    await page.getByRole("option", { name: /London, GB/ }).click();
    await form.getByRole("button", { name: "Search flights" }).click();

    const result = page.getByTestId("flight-offer-card");
    await expect(result).toContainText("BA304");
    await expect(result).toContainText("$120");
    expect(searches).toHaveLength(1);
    expect(searches[0]).toContain("origin=LHR");
    expect(searches[0]).toContain("destination=CDG%2CORY");

    await result.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Flight saved.")).toBeVisible();
    expect(created[0]).toMatchObject({
      origin: ["LHR"],
      destination: ["CDG", "ORY"],
      airline: "BA",
      flightNumber: "304",
    });

    await expect(page.getByTestId("flight-card")).toContainText("BA304");
    await expect(result.getByRole("button", { name: "Saved" })).toBeDisabled();

    // The day card for 1 Aug lists the flight too.
    await expect(
      page.getByRole("list", { name: "Flights" }).first(),
    ).toContainText("BA304 LHR → CDG");
  });

  test("lists saved flights first and keeps the search closed until asked", async ({
    page,
  }) => {
    await mockAuthCheck(page, true);
    await mockTripAndFlights(page, [savedFlight]);

    await page.goto("/trips/1");
    await page.getByRole("button", { name: "Flights" }).click();

    await expect(page.getByTestId("flight-card")).toContainText("BA304");
    await expect(
      page.getByRole("form", { name: "Search flights" }),
    ).toHaveCount(0);

    await page.getByRole("button", { name: "Search for flights" }).click();
    await expect(
      page.getByRole("form", { name: "Search flights" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Close flight search" }).click();
    await expect(
      page.getByRole("form", { name: "Search flights" }),
    ).toHaveCount(0);
  });

  test("requires a departure airport before searching", async ({ page }) => {
    await mockAuthCheck(page, true);
    const { searches } = await mockTripAndFlights(page);

    await page.goto("/trips/1");
    await page.getByRole("button", { name: "Flights" }).click();
    await page.getByRole("button", { name: "Search for a flight" }).click();

    const form = page.getByRole("form", { name: "Search flights" });
    await form.getByRole("button", { name: "Search flights" }).click();

    await expect(form.getByText("Choose a departure airport.")).toBeVisible();
    expect(searches).toHaveLength(0);
  });
});
