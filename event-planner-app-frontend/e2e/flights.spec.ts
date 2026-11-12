import { test, expect, type Page } from "@playwright/test";
import {
  buildTrip,
  json,
  mockApiDefaults,
  mockAuth,
  mockTrip,
} from "./helpers/api";

interface MockFlight {
  id: number;
  [key: string]: unknown;
}

const trip = buildTrip({ endDate: "2026-08-05", description: "Sightseeing" });

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
  departureAirportName: "Heathrow Airport",
  departureCity: "London",
  arrivalAirportName: "Charles de Gaulle Airport",
  arrivalCity: "Paris",
  travelClass: "Economy",
  luggage: ["1 cabin bag included"],
  extras: ["Average legroom (31 in)", "Carbon emissions estimate: 63 kg"],
  purchaseUrl: "https://www.google.com/travel/flights",
  airlineLogo: null,
};

const journey = {
  legs: [offer],
  priceGbp: 120,
  purchaseUrl: "https://www.google.com/travel/flights",
  stops: 0,
  totalDurationMinutes: 80,
};

const connectionJourney = {
  legs: [
    {
      ...offer,
      flightNumber: "427",
      arrivalAirport: "AMS",
      arrivalCity: "Amsterdam",
    },
    {
      ...offer,
      flightNumber: "641",
      departureAirport: "AMS",
      departureCity: "Amsterdam",
      departAt: "2026-08-01T11:00:00Z",
      arriveAt: "2026-08-01T12:20:00Z",
    },
  ],
  priceGbp: 90,
  purchaseUrl: "https://www.google.com/travel/flights",
  stops: 1,
  totalDurationMinutes: 200,
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
  departureAirportName: "Heathrow Airport",
  departureCity: "London",
  arrivalAirportName: "Charles de Gaulle Airport",
  arrivalCity: "Paris",
  travelClass: "Economy",
  luggage: ["1 cabin bag included"],
  extras: ["Average legroom (31 in)", "Carbon emissions estimate: 63 kg"],
  purchaseUrl: "https://www.google.com/travel/flights",
  airlineLogo: null,
  notes: null,
  expense: {
    id: 7,
    itineraryId: 1,
    description: "BA304 · LHR → CDG",
    category: "transport",
    amount: 120,
    currency: "GBP",
    amountGbp: 120,
    spentOn: "2026-08-01",
    paidById: 1,
    paidBy: { id: 1, username: "testuser" },
    flightId: 1,
    splitType: "even_all",
    shares: [{ userId: 1, amountGbp: 120 }],
    createdById: 1,
  },
};

async function mockTripAndFlights(
  page: Page,
  initialFlights: MockFlight[] = [],
  searchResults: unknown[] = [journey],
  numberResults: unknown[] = [journey],
) {
  const flights = initialFlights.map((flight) => structuredClone(flight));
  const created: unknown[] = [];
  const searches: string[] = [];
  const numberSearches: string[] = [];
  const numberCreated: unknown[] = [];

  await mockApiDefaults(page);
  await mockAuth(page, { signedIn: true });
  await mockTrip(page, trip);
  await page.route("**/api/itineraries/1/accommodations", (route) =>
    route.fulfill(json([])),
  );
  const saveLegs = (count: number) => {
    const saved: MockFlight[] = [];
    for (let leg = 0; leg < count; leg += 1) {
      saved.push({ ...structuredClone(savedFlight), id: flights.length + 1 });
      flights.push(saved[leg]);
    }
    return saved;
  };
  await page.route("**/api/itineraries/1/flights", async (route) => {
    if (route.request().method() === "POST") {
      const body = route.request().postDataJSON();
      created.push(body);
      await route.fulfill(json(saveLegs(body.legs.length), 201));
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
  await page.route("**/api/itineraries/1/expenses/*", async (route) => {
    if (route.request().method() === "DELETE") {
      const id = Number(route.request().url().split("/").pop());
      flights.forEach((flight) => {
        if ((flight.expense as { id: number } | null)?.id === id) {
          flight.expense = null;
        }
      });
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
    return route.fulfill(json(searchResults));
  });
  await page.route("**/api/itineraries/1/flights/by-number*", async (route) => {
    if (route.request().method() === "POST") {
      numberCreated.push(route.request().postDataJSON());
      const [found] = numberResults as (typeof journey)[];
      await route.fulfill(json(saveLegs(found.legs.length), 201));
      return;
    }
    numberSearches.push(new URL(route.request().url()).search);
    await route.fulfill(json(numberResults));
  });

  return { created, searches, numberSearches, numberCreated };
}

test.describe("Flights", () => {
  test("searches for a flight, saves it, and shows it on its day", async ({
    page,
  }) => {
    const { created, searches } = await mockTripAndFlights(page);

    await page.goto("/trips/1");
    await page.getByRole("button", { name: "Flights" }).click();
    await page.getByRole("button", { name: "Search for a flight" }).click();

    const form = page.getByRole("form", { name: "Search flights" });
    await expect(form.getByLabel("Arriving at")).toHaveValue("Paris, FR");

    await form.getByLabel("Departing from").fill("lon");
    await page.getByRole("option", { name: /London, GB/ }).click();
    await form.getByRole("button", { name: "Search flights" }).click();

    const result = page.getByTestId("flight-journey-card");
    await expect(result).toContainText("BA304");
    await expect(result).toContainText("£120");
    expect(searches).toHaveLength(1);
    expect(searches[0]).toContain("origin=LHR");
    expect(searches[0]).toContain("destination=CDG%2CORY");

    await expect(result).toContainText("London");
    await expect(result).toContainText("Direct flight · 1 cabin bag included");
    await result.getByRole("button", { name: "Save flight" }).click();
    await expect(page.getByText("Flight saved.")).toBeVisible();
    expect(created[0]).toMatchObject({
      origin: ["LHR"],
      destination: ["CDG", "ORY"],
      legs: [{ airline: "BA", flightNumber: "304" }],
    });

    await expect(page.getByTestId("flight-card")).toContainText("BA304");
    await expect(page.getByTestId("flight-card")).toBeInViewport();
    await expect(page.getByTestId("flight-card")).toHaveClass(/ring-2/);
    await expect(
      page.getByRole("link", { name: "Book flight" }),
    ).toHaveAttribute("href", "https://www.google.com/travel/flights");
    await expect(result.getByRole("button", { name: "Saved" })).toBeDisabled();

    // The day card for 1 Aug lists the flight too.
    await page.getByRole("button", { name: "Activities" }).click();
    await expect(
      page.getByRole("list", { name: "Flights" }).first(),
    ).toContainText("BA304 LHR → CDG");
  });

  test("shows a connection with its layover and saves every leg", async ({
    page,
  }) => {
    const { created } = await mockTripAndFlights(page, [], [connectionJourney]);

    await page.goto("/trips/1");
    await page.getByRole("button", { name: "Flights" }).click();
    await page.getByRole("button", { name: "Search for a flight" }).click();

    const form = page.getByRole("form", { name: "Search flights" });
    await form.getByLabel("Departing from").fill("lon");
    await page.getByRole("option", { name: /London, GB/ }).click();
    await form.getByRole("button", { name: "Search flights" }).click();

    const result = page.getByTestId("flight-journey-card");
    await expect(result).toContainText("BA427 + BA641");
    await expect(result).toContainText("Via Amsterdam (AMS)");
    await expect(result).toContainText("1 stop");
    await expect(result).not.toContainText("layover ·");

    await result
      .getByRole("button", { name: "Show flight & layover details" })
      .click();
    await expect(result).toContainText("0h 40m layover · Amsterdam (AMS)");

    await result.getByRole("button", { name: "Save 2 flights" }).click();
    await expect(page.getByText("Flights saved.")).toBeVisible();
    expect(created[0]).toMatchObject({
      legs: [
        { airline: "BA", flightNumber: "427" },
        { airline: "BA", flightNumber: "641" },
      ],
    });
  });

  test("looks up a flight by its number and saves the legs it flies", async ({
    page,
  }) => {
    const { numberSearches, numberCreated } = await mockTripAndFlights(
      page,
      [],
      [],
      [connectionJourney],
    );

    await page.goto("/trips/1");
    await page.getByRole("button", { name: "Flights" }).click();
    await page.getByRole("button", { name: "Search for a flight" }).click();
    await page.getByRole("button", { name: "By flight number" }).click();

    const form = page.getByRole("form", { name: "Search by flight number" });
    await form.getByRole("button", { name: "Search flight number" }).click();
    await expect(form.getByText("Flight number is required.")).toBeVisible();

    await form.getByLabel("Flight number").fill("ba 427");
    await form.getByRole("button", { name: "Search flight number" }).click();

    const result = page.getByTestId("flight-journey-card");
    await expect(result).toContainText("BA427");
    await expect(result).toContainText("BA427 + BA641");
    expect(numberSearches).toHaveLength(1);
    expect(numberSearches[0]).toContain("flightCode=ba+427");
    expect(numberSearches[0]).toContain("departureDate=2026-08-01");

    await result.getByRole("button", { name: "Save 2 flights" }).click();
    await expect(page.getByText("Flights saved.")).toBeVisible();
    expect(numberCreated[0]).toMatchObject({
      flightCode: "ba 427",
      departureDate: "2026-08-01",
    });
  });

  test("tells the user when a flight number does not fly that day", async ({
    page,
  }) => {
    await mockTripAndFlights(page, [], [], []);

    await page.goto("/trips/1");
    await page.getByRole("button", { name: "Flights" }).click();
    await page.getByRole("button", { name: "Search for a flight" }).click();
    await page.getByRole("button", { name: "By flight number" }).click();

    const form = page.getByRole("form", { name: "Search by flight number" });
    await form.getByLabel("Flight number").fill("BA999");
    await form.getByRole("button", { name: "Search flight number" }).click();

    await expect(
      page.getByText("That flight does not operate on this date"),
    ).toBeVisible();
  });

  test("shows the flight's expense and lets it be deleted on its own", async ({
    page,
  }) => {
    await mockTripAndFlights(page, [savedFlight]);

    await page.goto("/trips/1");
    await page.getByRole("button", { name: "Flights" }).click();

    const card = page.getByTestId("flight-card");
    const chip = card.getByRole("button", {
      name: "Edit expense: BA304 · LHR → CDG",
    });
    await expect(chip).toContainText("£120");
    await expect(card.getByRole("button", { name: "Add expense" })).toHaveCount(
      0,
    );

    await chip.click();
    await expect(page.getByLabel("Description")).toHaveValue(
      "BA304 · LHR → CDG",
    );
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Yes, delete" }).click();

    await expect(page.getByText("Expense deleted.")).toBeVisible();
    await expect(card).toContainText("BA304");
    await expect(
      card.getByRole("button", { name: "Add expense" }),
    ).toBeVisible();
  });
});
