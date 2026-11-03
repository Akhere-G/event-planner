import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import type { Trip } from "../../trips/types";
import PlannedBudgetPanel from "../components/PlannedBudgetPanel";

const trip = (role: string): Trip => ({
  id: 5,
  name: "Paris",
  destination: "Paris",
  latitude: 0,
  longitude: 0,
  role,
  timezone: "Europe/Paris",
  budgetAmountGbp: 1000,
  startDate: "2026-08-01",
  endDate: "2026-08-04",
  userMemberships: [
    { id: 1, username: "ann", email: "a@x.com", role },
    { id: 2, username: "ben", email: "b@x.com", role },
  ],
  events: [
    {
      id: 11,
      name: "Louvre",
      address: "",
      latitude: 0,
      longitude: 0,
      startAt: "2026-08-02 10:00",
      endAt: "2026-08-02 12:00",
      category: "culture",
      estimatedCostGbp: 20,
      priceTier: 2,
    },
  ],
  invites: [],
  createdAt: "2026-01-01",
  anonymousAccessCode: null,
});

const mockAccommodations = () =>
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(
      async () =>
        new Response(JSON.stringify({ success: true, data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    ),
  );

afterEach(() => vi.unstubAllGlobals());

describe("PlannedBudgetPanel", () => {
  it("compares the group's planned cost with actual spend and the budget", () => {
    mockAccommodations();
    renderWithProviders(
      <PlannedBudgetPanel trip={trip("editor")} expenses={[]} />,
    );

    expect(
      screen.getByText("Planned (estimated)").nextSibling,
    ).toHaveTextContent("£40.00");
    expect(screen.getByText("Actual").nextSibling).toHaveTextContent("£0.00");
    expect(screen.getByText("Budget").nextSibling).toHaveTextContent(
      "£1,000.00",
    );
  });

  it("pre-fills the expense form from the estimate when logging it", async () => {
    mockAccommodations();
    renderWithProviders(
      <PlannedBudgetPanel trip={trip("editor")} expenses={[]} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Log Louvre as expense" }),
    );

    await screen.findByRole("dialog");
    expect(screen.getByLabelText("Description")).toHaveValue("Louvre");
    expect(screen.getByLabelText(/Amount/)).toHaveValue(40);
    expect(screen.getByLabelText("Date")).toHaveValue("2026-08-02");
  });

  it("does not offer to log expenses to viewers", () => {
    mockAccommodations();
    renderWithProviders(
      <PlannedBudgetPanel trip={trip("viewer")} expenses={[]} />,
    );

    expect(
      screen.queryByRole("button", { name: /as expense/ }),
    ).not.toBeInTheDocument();
  });
});
