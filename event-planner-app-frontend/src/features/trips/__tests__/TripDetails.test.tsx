import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import TripDetails from "../components/TripDetails";
import type { Trip } from "../types";
import { TRIP } from "../../aiTasks/__tests__/fixtures";

vi.mock("../components/TripSummary", () => ({ default: () => null }));
vi.mock("../components/TripActivities", () => ({ default: () => null }));
vi.mock("../../accommodations/components/AccommodationPage", () => ({
  default: () => null,
}));
vi.mock("../../packing/components", () => ({ PackingPage: () => null }));
vi.mock("../../flights/components/FlightsPanel", () => ({
  default: () => null,
}));
vi.mock("../../expenses/components", () => ({ BudgetPage: () => null }));
vi.mock("../../realtime", () => ({ useTripRealtime: () => undefined }));
vi.mock("../hooks/useLoadAnonTrip", () => ({
  default: () => ({ anonTrip: null }),
}));
vi.mock("../../aiTasks/components", () => ({
  ProposalsHost: () => null,
  TaskProgressCards: () => null,
  ProposalReviewModal: () => null,
}));

function renderAs(role: string) {
  renderWithProviders(
    <TripDetails {...(TRIP as unknown as Trip)} role={role} />,
  );
}

describe("TripDetails", () => {
  it.each(["admin", "editor"])("lets a %s ask the AI to edit", (role) => {
    renderAs(role);

    expect(
      screen.getByRole("button", { name: "Ask AI to edit" }),
    ).toBeInTheDocument();
  });

  it("hides the AI editing from viewers", () => {
    renderAs("viewer");

    expect(
      screen.queryByRole("button", { name: "Ask AI to edit" }),
    ).not.toBeInTheDocument();
  });
});
