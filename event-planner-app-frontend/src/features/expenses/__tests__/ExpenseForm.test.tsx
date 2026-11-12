import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setCredentials } from "../../auth/services/authSlice";
import { getLastCurrency, saveLastCurrency } from "../../currency/lastCurrency";
import {
  createTestStore,
  renderWithProviders,
} from "../../../test-utils/renderWithProviders";
import type { Trip } from "../../trips/types";
import ExpenseForm from "../components/ExpenseForm";

// The trip snapshot is stale: the event below was added after it was fetched.
const trip = {
  id: 1,
  role: "admin",
  timezone: "Europe/London",
  events: [],
} as unknown as Trip;

const users = {
  users: [
    { id: 5, username: "sam" },
    { id: 6, username: "kit" },
  ],
};
const newEvent = {
  id: 3,
  name: "Louvre visit",
  startAt: "2026-08-02T09:00:00Z",
  endAt: "2026-08-02T11:00:00Z",
};

function stubApi() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(async (request: Request) => {
      const { pathname } = new URL(request.url);
      const data = pathname.endsWith("/events")
        ? { events: [newEvent] }
        : pathname.endsWith("/itineraries/1")
          ? trip
          : pathname.endsWith("/fx/rates")
            ? { base: "GBP", rates: { GBP: 1, EUR: 1.25 } }
            : pathname.endsWith("/users")
              ? users
              : [];
      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("ExpenseForm", () => {
  it("lists events added after the trip was loaded", async () => {
    stubApi();
    const user = userEvent.setup();
    renderWithProviders(
      <ExpenseForm trip={trip} onSuccess={vi.fn()} onCancel={vi.fn()} />,
    );

    await user.selectOptions(screen.getByLabelText("Link to"), "event");

    expect(
      await screen.findByRole("option", { name: "Louvre visit" }),
    ).toBeInTheDocument();
  });

  it.each([
    ["editor", ["sam"]],
    ["admin", ["sam", "kit"]],
  ])("offers a %s these payers", async (role, names) => {
    stubApi();
    const store = createTestStore();
    store.dispatch(setCredentials({ id: 5 }));
    renderWithProviders(
      <ExpenseForm
        trip={{ ...trip, role }}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />,
      { store },
    );

    const select = await screen.findByLabelText("Paid by");
    const offered = await within(select).findAllByRole("option");

    expect(offered.map((option) => option.textContent)).toEqual(names);
  });

  describe("currency", () => {
    const renderForm = (
      props: Partial<Parameters<typeof ExpenseForm>[0]> = {},
    ) => {
      stubApi();
      const onSuccess = vi.fn();
      renderWithProviders(
        <ExpenseForm
          trip={trip}
          onSuccess={onSuccess}
          onCancel={vi.fn()}
          {...props}
        />,
      );
      return { onSuccess };
    };

    it("starts in pounds when no currency has been used before", () => {
      renderForm();

      expect(screen.getByLabelText("Currency")).toHaveValue("GBP");
      expect(screen.getByLabelText("Amount (GBP)")).toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("starts in the currency used last time", () => {
      saveLastCurrency("EUR");
      renderForm();

      expect(screen.getByLabelText("Currency")).toHaveValue("EUR");
      expect(screen.getByLabelText("Amount (EUR)")).toBeInTheDocument();
    });

    it("shows what the amount is worth in pounds", async () => {
      saveLastCurrency("EUR");
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/^Amount/), "100");

      expect(await screen.findByRole("status")).toHaveTextContent("≈ £80.00");
    });

    it("keeps an expense in the currency it was paid in", () => {
      saveLastCurrency("EUR");
      renderForm({
        expense: {
          id: 9,
          itineraryId: 1,
          description: "Taxi",
          category: "transport",
          amount: 20,
          currency: "USD",
          amountGbp: 16,
          fxRate: 0.8,
          spentOn: "2026-08-01",
          paidById: 5,
          splitType: "even_all",
          shares: [{ userId: 5, amountGbp: 16 }],
          createdById: 5,
        },
      });

      expect(screen.getByLabelText("Currency")).toHaveValue("USD");
    });

    it("remembers the currency of a saved expense", async () => {
      const store = createTestStore();
      store.dispatch(setCredentials({ id: 5 }));
      stubApi();
      const onSuccess = vi.fn();
      const user = userEvent.setup();
      renderWithProviders(
        <ExpenseForm trip={trip} onSuccess={onSuccess} onCancel={vi.fn()} />,
        { store },
      );

      await user.type(screen.getByLabelText("Description"), "Dinner");
      await user.type(screen.getByLabelText(/^Amount/), "40");
      await user.selectOptions(screen.getByLabelText("Currency"), "EUR");
      await user.click(screen.getByRole("button", { name: "Add expense" }));

      await waitFor(() => expect(onSuccess).toHaveBeenCalled());
      expect(getLastCurrency()).toBe("EUR");
    });
  });
});
