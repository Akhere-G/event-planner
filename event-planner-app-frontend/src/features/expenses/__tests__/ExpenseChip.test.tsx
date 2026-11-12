import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setCredentials } from "../../auth/services/authSlice";
import type { Trip } from "../../trips/types";
import {
  createTestStore,
  renderWithProviders,
} from "../../../test-utils/renderWithProviders";
import ExpenseChip from "../components/ExpenseChip";
import type { Expense } from "../types";

const trip = (role: string) =>
  ({
    id: 1,
    role,
    timezone: "Europe/London",
    events: [],
  }) as unknown as Trip;

const users = { users: [{ id: 5, username: "sam" }] };

const expense: Expense = {
  id: 9,
  itineraryId: 1,
  description: "Dinner",
  category: "food",
  amount: 45,
  currency: "GBP",
  amountGbp: 45,
  fxRate: 1,
  spentOn: "2026-08-01",
  paidById: 5,
  splitType: "even_all",
  shares: [{ userId: 5, amountGbp: 45 }],
  createdById: 5,
};

const prefill = { eventId: 3, description: "Museum" };

function stubApi() {
  const fetchMock = vi.fn().mockImplementation(async (request: Request) => {
    const data = new URL(request.url).pathname.endsWith("/users") ? users : [];
    return new Response(JSON.stringify({ success: true, data, message: "" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function renderChip(role: string, userId: number, item: Expense | null) {
  const store = createTestStore();
  store.dispatch(setCredentials({ id: userId }));
  return renderWithProviders(
    <ExpenseChip trip={trip(role)} expense={item} prefill={prefill} />,
    { store },
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("ExpenseChip", () => {
  it("offers Add expense to editors when there is no expense", () => {
    stubApi();
    renderChip("editor", 5, null);

    expect(
      screen.getByRole("button", { name: /add expense/i }),
    ).toBeInTheDocument();
  });

  it("shows nothing to viewers when there is no expense", () => {
    stubApi();
    renderChip("viewer", 5, null);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows the amount and an edit label, with the description as its name", () => {
    stubApi();
    renderChip("editor", 5, expense);

    const chip = screen.getByRole("button", { name: "Edit expense: Dinner" });
    expect(chip).toHaveTextContent("£45.00");
    expect(chip).toHaveTextContent(/edit/i);
    expect(
      screen.queryByRole("button", { name: /add expense/i }),
    ).not.toBeInTheDocument();
  });

  it("formats the amount in the expense's own currency", () => {
    stubApi();
    renderChip("admin", 1, { ...expense, currency: "EUR", amount: 820 });

    expect(screen.getByRole("button")).toHaveTextContent("€820.00");
  });

  it("is not clickable for someone who cannot change the expense", () => {
    stubApi();
    renderChip("editor", 6, expense);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("£45.00")).toBeInTheDocument();
  });

  it("opens the edit form prefilled with the expense", async () => {
    stubApi();
    const user = userEvent.setup();
    renderChip("editor", 5, expense);

    await user.click(screen.getByRole("button", { name: /edit expense/i }));

    expect(await screen.findByDisplayValue("Dinner")).toBeInTheDocument();
    expect(screen.getByDisplayValue("45")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save expense" }),
    ).toBeInTheDocument();
  });

  it("deletes the expense from the edit form after confirming", async () => {
    const fetchMock = stubApi();
    const user = userEvent.setup();
    renderChip("editor", 5, expense);

    await user.click(screen.getByRole("button", { name: /edit expense/i }));
    await user.click(await screen.findByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    await waitFor(() => {
      const deleteCall = fetchMock.mock.calls
        .map(([request]) => request as Request)
        .find((request) => request.method === "DELETE");
      expect(deleteCall?.url).toContain("/itineraries/1/expenses/9");
    });
  });

  it("lets an admin delete an expense someone else added", async () => {
    stubApi();
    renderChip("admin", 1, { ...expense, createdById: 5 });
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /edit expense/i }));

    expect(await screen.findByDisplayValue("Dinner")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete" }),
    ).toBeInTheDocument();
  });
});
