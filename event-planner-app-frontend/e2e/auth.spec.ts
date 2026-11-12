import { test, expect } from "@playwright/test";
import {
  buildTrip,
  jsonError,
  json,
  mockApiDefaults,
  mockAuth,
  mockTrip,
  USER,
  type Session,
} from "./helpers/api";
import { expectLoginPage, login } from "./helpers/auth";

const trip = buildTrip();

async function setup(page: import("@playwright/test").Page, signedIn = false) {
  const session: Session = { signedIn };
  await mockApiDefaults(page);
  await page.route("**/api/itineraries?*", (route) =>
    route.fulfill(json({ itineraries: [trip], hasMore: false })),
  );
  await mockTrip(page, trip);
  await page.route("**/api/invites*", (route) =>
    route.fulfill(json({ invites: [] })),
  );
  await mockAuth(page, session);
  return session;
}

test.describe("Signing in", () => {
  test("a guest is sent to login from a members-only page and returns to it afterwards", async ({
    page,
  }) => {
    await setup(page);

    await page.goto("/invites");
    await expectLoginPage(page);

    await login(page);

    await expect(page).toHaveURL("/invites");
    await expect(
      page.getByRole("heading", { name: "Invites", exact: true }),
    ).toBeVisible();
  });

  test("wrong credentials keep the user on login with an error toast", async ({
    page,
  }) => {
    await setup(page);
    await page.route("**/api/auth/login", (route) =>
      route.fulfill(jsonError("Invalid credentials.", 401)),
    );

    await page.goto("/login");
    await login(page, { email: "wrong@example.com", password: "nope-nope" });

    await expect(
      page.locator('[data-sonner-toast][data-type="error"]'),
    ).toBeVisible();
    await expectLoginPage(page);
  });

  test("logging in lists the user's trips, and logging out returns them to guest pages", async ({
    page,
  }) => {
    await setup(page);

    await page.goto("/login");
    await login(page);

    await expect(
      page.getByRole("heading", { name: trip.name, level: 3 }),
    ).toBeVisible();

    await page
      .getByRole("button")
      .filter({ has: page.locator("svg.lucide-user") })
      .click();
    const reloaded = page.waitForEvent("load");
    await page.getByRole("menuitem", { name: "Logout" }).click();
    await reloaded;

    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await page.goto("/invites");
    await expectLoginPage(page);
  });

  test("a signed-in user is redirected away from the login and register pages", async ({
    page,
  }) => {
    await setup(page, true);

    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Your Trips" }),
    ).toBeVisible();

    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: "Your Trips" }),
    ).toBeVisible();
  });
});

test.describe("Registering", () => {
  const fill = async (
    page: import("@playwright/test").Page,
    overrides: {
      email?: string;
      repeatPassword?: string;
      terms?: boolean;
    } = {},
  ) => {
    await page.getByRole("textbox", { name: "username" }).fill("newuser");
    await page
      .getByRole("textbox", { name: "email" })
      .fill(overrides.email ?? "new@example.com");
    await page.getByTestId("password").fill("Password123!");
    await page
      .getByTestId("repeatPassword")
      .fill(overrides.repeatPassword ?? "Password123!");
    if (overrides.terms ?? true) {
      await page.getByRole("checkbox").check();
    }
    await page.getByRole("button", { name: "Register" }).click();
  };

  test("creates the account with a lowercased email and signs the user in", async ({
    page,
  }) => {
    const session = await setup(page);
    let body: Record<string, unknown> | undefined;
    await page.route("**/api/auth/register", (route) => {
      body = route.request().postDataJSON();
      session.signedIn = true;
      return route.fulfill(json(USER, 201));
    });

    await page.goto("/register");
    await fill(page, { email: "NEW@Example.COM" });

    await expect(
      page.getByRole("heading", { name: "Your Trips" }),
    ).toBeVisible();
    expect(body?.email).toBe("new@example.com");
  });

  test("is blocked client-side until the terms are accepted and the passwords match", async ({
    page,
  }) => {
    await setup(page);
    let registerCalls = 0;
    await page.route("**/api/auth/register", (route) => {
      registerCalls += 1;
      return route.fulfill(json(USER));
    });

    await page.goto("/register");
    await fill(page, { terms: false });
    await expect(
      page.getByText(
        "Please agree to the Terms and Conditions and Privacy Policy before registering.",
      ),
    ).toBeVisible();

    await page.getByRole("checkbox").check();
    await page.getByTestId("repeatPassword").fill("Different123!");
    await page.getByRole("button", { name: "Register" }).click();
    await expect(page.getByText(/passwords.*match/i)).toBeVisible();

    expect(registerCalls).toBe(0);
    await expect(page).toHaveURL(/\/register/);
  });

  test("shows the server's field errors and stays on the form", async ({
    page,
  }) => {
    await setup(page);
    await page.route("**/api/auth/register", (route) =>
      route.fulfill(jsonError({ username: ["Username already exists."] })),
    );

    await page.goto("/register");
    await fill(page);

    await expect(page.getByText("Username already exists.")).toBeVisible();
    await expect(page).toHaveURL(/\/register/);
  });
});
