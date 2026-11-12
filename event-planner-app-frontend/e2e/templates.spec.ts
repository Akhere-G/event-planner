import { test, expect, type Page } from "@playwright/test";
import { json, mockApiDefaults, mockAuth, type Session } from "./helpers/api";
import { login } from "./helpers/auth";

const PARIS = {
  slug: "paris-4-days-itinerary",
  title: "Paris in 4 days",
  description: "A first visit to Paris.",
  destination: "Paris, France",
  region: "Europe",
  latitude: 48.85,
  longitude: 2.35,
  durationDays: 4,
  coverImage: null,
  authorName: null,
  cloneCount: 3,
  createdAt: "2026-11-01T00:00:00",
  eventCount: 1,
  placeCount: 1,
};
const TOKYO = {
  ...PARIS,
  slug: "tokyo-1-week-itinerary",
  title: "Tokyo in a week",
  destination: "Tokyo, Japan",
  region: "Asia",
  durationDays: 7,
};

const PARIS_DETAIL = {
  ...PARIS,
  timezone: "Europe/Paris",
  days: [
    {
      dayOffset: 0,
      events: [
        {
          name: "Louvre",
          description: "Start with the Mona Lisa.",
          address: "Rue de Rivoli, Paris",
          latitude: 48.86,
          longitude: 2.33,
          category: "culture",
          dayOffset: 0,
          startTime: "09:30",
          endDayOffset: 0,
          endTime: "12:30",
        },
      ],
    },
  ],
  accommodations: [],
  packingItems: [],
  wishlistItems: [],
};

function pinOf(template: typeof PARIS) {
  const { slug, title, destination, region, latitude, longitude } = template;
  return { slug, title, destination, region, latitude, longitude };
}

async function mockTemplatesApi(page: Page, { loggedIn = true } = {}) {
  const session: Session = { signedIn: loggedIn };
  const state = { cloneBody: undefined as unknown };

  await mockApiDefaults(page);
  await mockAuth(page, session);
  await page.route("**/api/templates?**", (route) => {
    const regions = new URL(route.request().url()).searchParams.get("regions");
    const templates = [PARIS, TOKYO].filter(
      (t) => !regions || regions.split(",").includes(t.region),
    );
    return route.fulfill(
      json({ templates, total: templates.length, hasMore: false }),
    );
  });
  await page.route("**/api/templates/pins*", (route) =>
    route.fulfill(json([pinOf(PARIS), pinOf(TOKYO)])),
  );
  await page.route(`**/api/templates/${PARIS.slug}`, (route) =>
    route.fulfill(json(PARIS_DETAIL)),
  );
  await page.route(`**/api/templates/${PARIS.slug}/clone`, (route) => {
    state.cloneBody = route.request().postDataJSON();
    return route.fulfill(
      json(
        {
          id: 42,
          name: PARIS.title,
          startDate: "2027-03-27",
          endDate: "2027-03-30",
        },
        201,
      ),
    );
  });
  return state;
}

test.describe("Templates", () => {
  test("anyone can browse templates and filter them by region", async ({
    page,
  }) => {
    await mockTemplatesApi(page, { loggedIn: false });
    await page.goto("/templates");

    await expect(page.getByText("Paris in 4 days")).toBeVisible();
    await expect(page.getByText("Tokyo in a week")).toBeVisible();

    await page.getByRole("button", { name: /Asia/ }).click();

    await expect(page.getByText("Tokyo in a week")).toBeVisible();
    await expect(page.getByText("Paris in 4 days")).toBeHidden();
    await expect(page.getByRole("button", { name: /Asia/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await page.getByRole("button", { name: /Asia/ }).click();
    await expect(page.getByText("Paris in 4 days")).toBeVisible();
  });

  test("a template can be read without logging in", async ({ page }) => {
    await mockTemplatesApi(page, { loggedIn: false });
    await page.goto("/templates");

    await page.getByRole("link", { name: "Paris in 4 days" }).click();

    await expect(page).toHaveURL(`/templates/${PARIS.slug}`);
    await expect(page.getByRole("heading", { name: "Day 1" })).toBeVisible();
    await expect(page.getByText("Louvre")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Clone this trip" }),
    ).toBeVisible();
  });

  test("cloning while logged out goes to login and returns to the clone form", async ({
    page,
  }) => {
    const state = await mockTemplatesApi(page, { loggedIn: false });
    await page.goto(`/templates/${PARIS.slug}`);

    await page.getByRole("link", { name: "Clone this trip" }).click();

    await expect(page).toHaveURL(/\/login/);
    await login(page);

    await expect(page).toHaveURL(`/templates/${PARIS.slug}/clone`);
    await page.getByLabel("Start date").fill("2027-03-27");
    await page.getByRole("button", { name: "Create trip" }).click();

    await expect(page).toHaveURL("/trips/42");
    expect(state.cloneBody).toEqual({ startDate: "2027-03-27" });
  });

  test("a logged-in user can clone straight away", async ({ page }) => {
    const state = await mockTemplatesApi(page);
    await page.goto(`/templates/${PARIS.slug}`);

    await page.getByRole("link", { name: "Clone this trip" }).click();
    await page.getByLabel("Start date").fill("2027-03-27");
    await page.getByRole("button", { name: "Create trip" }).click();

    await expect(page).toHaveURL("/trips/42");
    expect(state.cloneBody).toEqual({ startDate: "2027-03-27" });
  });
});
