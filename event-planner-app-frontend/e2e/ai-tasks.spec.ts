import { test, expect, type Page } from "@playwright/test";
import {
  buildTrip,
  json,
  mockApiDefaults,
  mockAuth,
  mockTrip as mockTripRoute,
} from "./helpers/api";

const trip = buildTrip();

const task = (overrides: Record<string, unknown> = {}) => ({
  id: 9,
  tripId: 1,
  tripName: trip.name,
  type: "optimise_day",
  status: "running",
  params: { dates: ["2026-08-02"] },
  progressText: null,
  progressCurrent: null,
  progressTotal: null,
  errorMessage: null,
  appliedCounts: null,
  opCount: 0,
  createdAt: "2026-08-01T09:00:00",
  finishedAt: null,
  expiresAt: null,
  ...overrides,
});

const detail = task({
  status: "ready",
  opCount: 1,
  expiresAt: "2026-08-08T09:00:00",
}) as Record<string, unknown>;
detail.ops = [
  {
    op: "create",
    entity: "event",
    data: {
      name: "Dinner at Le Jules Verne",
      address: "Eiffel Tower",
      startAt: "2026-08-02T17:00:00Z",
      endAt: "2026-08-02T19:00:00Z",
    },
    reason: "Close to your hotel.",
  },
];
detail.changedOpIndexes = [];
detail.unavailableOpIndexes = [];

async function mockTrip(page: Page, tripTasks: () => unknown[]) {
  await mockApiDefaults(page);
  await mockAuth(page, { signedIn: true });
  await mockTripRoute(page, trip);
  await page.route("**/api/itineraries/1/events", (route) =>
    route.fulfill(json({ events: [] })),
  );
  await page.route("**/api/itineraries/1/accommodations", (route) =>
    route.fulfill(json([])),
  );
  await page.route("**/api/itineraries/1/flights", (route) =>
    route.fulfill(json([])),
  );
  await page.route("**/api/itineraries/1/preferences", (route) =>
    route.fulfill(json(null)),
  );
  await page.route("**/api/itineraries/1/ai-tasks", (route) =>
    route.fulfill(json(tripTasks())),
  );
}

test.describe("Background AI tasks", () => {
  test("a finished proposal pops up and can be applied", async ({ page }) => {
    const accepted: unknown[] = [];
    await mockTrip(page, () => []);
    await page.route("**/api/itineraries/1/ai-tasks/pending", (route) =>
      route.fulfill(json(accepted.length ? [] : [detail])),
    );
    await page.route("**/api/itineraries/1/ai-tasks/9", (route) =>
      route.fulfill(json(detail)),
    );
    await page.route("**/api/itineraries/1/ai-tasks/9/accept", (route) => {
      accepted.push(route.request().postDataJSON());
      return route.fulfill(
        json({
          applied: { created: 1, updated: 0, deleted: 0 },
          skippedUnavailable: 0,
        }),
      );
    });

    await page.goto("/trips/1");

    await expect(
      page.getByRole("heading", { name: "An AI suggestion is ready" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Review" }).click();
    await expect(page.getByText("Dinner at Le Jules Verne")).toBeVisible();
    await page.getByRole("button", { name: "Apply 1 change" }).click();

    await expect(page.getByText("Changes applied: 1 added.")).toBeVisible();
    expect(accepted).toEqual([{ opIndexes: [0] }]);
  });

  test("a running task shows its progress and can be cancelled", async ({
    page,
  }) => {
    let cancelled = false;
    await mockTrip(page, () =>
      cancelled
        ? []
        : [
            task({
              progressText: "Optimising day",
              progressCurrent: 1,
              progressTotal: 2,
            }),
          ],
    );
    await page.route("**/api/itineraries/1/ai-tasks/pending", (route) =>
      route.fulfill(json([])),
    );
    await page.route("**/api/itineraries/1/ai-tasks/9/cancel", (route) => {
      cancelled = true;
      return route.fulfill(json(task({ status: "cancelled" })));
    });

    await page.goto("/trips/1");

    await expect(page.getByText("Optimising day 1/2")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Optimise days cancelled.")).toBeVisible();
    await expect(page.getByText("Optimising day 1/2")).toBeHidden();
  });

  test("a failed task can be retried", async ({ page }) => {
    let retried = false;
    await mockTrip(page, () =>
      retried
        ? [task({ id: 10, status: "queued" })]
        : [
            task({
              status: "failed",
              errorMessage: "The AI service was unavailable.",
            }),
          ],
    );
    await page.route("**/api/itineraries/1/ai-tasks/pending", (route) =>
      route.fulfill(json([])),
    );
    await page.route("**/api/itineraries/1/ai-tasks/9/retry", (route) => {
      retried = true;
      return route.fulfill(json(task({ id: 10, status: "queued" }), 202));
    });

    await page.goto("/trips/1");

    await expect(
      page.getByText("The AI service was unavailable."),
    ).toBeVisible();
    await page.getByRole("button", { name: "Retry" }).click();
    await expect(page.getByText("Optimise days started again.")).toBeVisible();
    await expect(page.getByText("Waiting to start")).toBeVisible();
  });
});
