import { Page, expect } from "@playwright/test";

export interface MockTrip {
  id: number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  description?: string;
  role?: string;
}

export const defaultMockTrips: MockTrip[] = [
  {
    id: 1,
    name: "Summer Vacation in Paris",
    destination: "Paris, France",
    startDate: "2026-08-01",
    endDate: "2026-08-10",
    description: "Sightseeing, food & museums",
    role: "admin",
  },
  {
    id: 2,
    name: "Tokyo Adventure",
    destination: "Tokyo, Japan",
    startDate: "2026-09-15",
    endDate: "2026-09-25",
    description: "Exploring Shibuya and Shinjuku",
    role: "editor",
  },
];

export async function mockGetTrips(
  page: Page,
  trips: MockTrip[] = defaultMockTrips,
) {
  await page.route("**/api/itineraries*", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Fetched user itineraries.",
        data: {
          itineraries: trips,
          hasMore: false,
        },
      }),
    });
  });
}

export async function mockUnauthorisedTrips(page: Page) {
  await page.route("**/api/itineraries*", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        message: "Not authenticated.",
      }),
    });
  });
}

export async function mockCreateTrip(
  page: Page,
  tripOverrides: Partial<MockTrip> = {},
) {
  await page.route("**/api/itineraries*", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    const postData = route.request().postDataJSON();

    const newTrip: MockTrip = {
      id: 999,
      name: postData?.name ?? "New Trip",
      destination: postData?.destination ?? "New Destination",
      startDate: postData?.startDate ?? "2026-09-01",
      endDate: postData?.endDate ?? "2026-09-05",
      description: postData?.description,
      role: "admin",
      ...tripOverrides,
    };

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Successfully created new itinerary.",
        data: newTrip,
      }),
    });
  });
}

export async function mockCreateTripError(
  page: Page,
  message = "Unable to create itinerary.",
) {
  await page.route("**/api/itineraries*", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        error: message,
      }),
    });
  });
}

export async function expectTripVisible(page: Page, trip: MockTrip) {
  await expect(page.getByText(trip.name)).toBeVisible();
  await expect(page.getByText(trip.destination)).toBeVisible();
}

export async function expectTripsVisible(
  page: Page,
  trips: MockTrip[] = defaultMockTrips,
) {
  for (const trip of trips) {
    await expectTripVisible(page, trip);
  }
}
