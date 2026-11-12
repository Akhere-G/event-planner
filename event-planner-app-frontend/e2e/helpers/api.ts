import type { Page, Route } from "@playwright/test";

export interface MockUser {
  id: number;
  username: string;
  email: string;
  isDemo: boolean;
}

export const USER: MockUser = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
  isDemo: false,
};

export const json = (data: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify({ success: status < 400, message: "ok", data }),
});

export const jsonError = (error: unknown, status = 400) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify({ success: false, error }),
});

export const buildTrip = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  name: "Summer Vacation in Paris",
  destination: "Paris, France",
  latitude: 48.8566,
  longitude: 2.3522,
  timezone: "Europe/Paris",
  startDate: "2026-08-01",
  endDate: "2026-08-03",
  role: "admin",
  events: [],
  invites: [],
  userMemberships: [{ ...USER, role: "admin" }],
  createdAt: "2026-07-01T00:00:00Z",
  anonymousAccessCode: null,
  ...overrides,
});

export interface Session {
  signedIn: boolean;
}

/**
 * Routes the auth endpoints through one mutable session, so signing in or out
 * changes what the next /auth/check returns, as the real backend would.
 */
export async function mockAuth(page: Page, session: Session) {
  await page.route("**/api/auth/check", (route) =>
    session.signedIn
      ? route.fulfill(json(USER))
      : route.fulfill({ ...jsonError("Not authenticated.", 401) }),
  );
  await page.route("**/api/auth/login", (route) => {
    session.signedIn = true;
    return route.fulfill(json(USER));
  });
  await page.route("**/api/auth/logout", (route) => {
    session.signedIn = false;
    return route.fulfill(json(null));
  });
}

const FIXED_NOW = "2026-07-15T10:00:00Z";

/**
 * Starts every spec from the same known state: "today" is fixed ahead of the
 * fixture trips, Google Maps stays off the network, and any /api call a spec
 * has not mocked itself gets an empty list. Call it before the other mocks,
 * because Playwright tries the most recently registered route first.
 */
export async function mockApiDefaults(page: Page) {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.route("**/maps.googleapis.com/**", (route) => route.abort());
  await page.route(
    (url) => url.pathname.startsWith("/api/"),
    (route: Route) => route.fulfill(json([])),
  );
}

export async function mockTrip(
  page: Page,
  trip: ReturnType<typeof buildTrip> = buildTrip(),
) {
  await page.route(`**/api/itineraries/${trip.id}`, (route) =>
    route.fulfill(json(trip)),
  );
  await page.route(`**/api/itineraries/${trip.id}/events`, (route) =>
    route.fulfill(json({ events: [] })),
  );
}
