import { test, expect, type Page } from "@playwright/test";
import {
  buildTrip,
  json,
  mockApiDefaults,
  mockAuth,
  mockTrip,
} from "./helpers/api";

const members = [
  { id: 1, username: "testuser", email: "test@example.com", role: "admin" },
  { id: 2, username: "sam", email: "sam@example.com", role: "editor" },
];

const trip = buildTrip({
  endDate: "2026-08-10",
  budgetAmountGbp: 200,
  userMemberships: members,
});

async function mockBudgetApi(page: Page) {
  const expenses: Record<string, unknown>[] = [];

  await mockApiDefaults(page);
  await mockAuth(page, { signedIn: true });
  await mockTrip(page, trip);
  await page.route("**/api/itineraries/1/expenses/balances", (route) => {
    const spent = expenses.reduce((s, e) => s + (e.amountGbp as number), 0);
    route.fulfill(
      json({
        balances: [
          { userId: 1, username: "testuser", netGbp: spent / 2 },
          { userId: 2, username: "sam", netGbp: -spent / 2 },
        ],
        transfers: spent
          ? [{ fromUserId: 2, toUserId: 1, amountGbp: spent / 2 }]
          : [],
        totalSpentGbp: spent,
      }),
    );
  });
  await page.route("**/api/itineraries/1/expenses", async (route) => {
    if (route.request().method() === "POST") {
      const body = route.request().postDataJSON();
      const expense = {
        id: expenses.length + 1,
        ...body,
        amountGbp: Number(body.amount),
        currency: "GBP",
        paidBy: { id: 1, username: "testuser" },
        createdById: 1,
        shares: [],
      };
      expenses.push(expense);
      await route.fulfill(json(expense, 201));
      return;
    }
    await route.fulfill(json(expenses));
  });
}

test.describe("Budget tab", () => {
  test("adds an expense and shows it against the budget and balances", async ({
    page,
  }) => {
    await mockBudgetApi(page);

    await page.goto("/trips/1?activeTab=budget");

    await expect(page.getByText("£0.00 spent of £200.00")).toBeVisible();
    await expect(
      page.getByText("No expenses yet. Add the first one to start tracking."),
    ).toBeVisible();

    await page.getByRole("button", { name: "Add expense" }).first().click();
    await page.getByLabel("Description").fill("Dinner at the harbour");
    await page.getByLabel("Amount (GBP)").fill("50");
    await page.getByRole("button", { name: "Add expense" }).last().click();

    await expect(page.getByText("Expense added.")).toBeVisible();
    await expect(page.getByText("Dinner at the harbour")).toBeVisible();
    await expect(page.getByText("£50.00 spent of £200.00")).toBeVisible();
    await expect(page.getByText("£150.00 left")).toBeVisible();
    await expect(page.getByText("owes £25.00")).toBeVisible();
  });
});
