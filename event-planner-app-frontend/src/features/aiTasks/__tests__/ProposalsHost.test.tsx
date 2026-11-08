import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import { mockApi } from "../../../test-utils/mockApi";
import ProposalsHost from "../components/ProposalsHost";
import { aiTask, aiTaskDetail, EVENT, ok, TRIP } from "./fixtures";

const READY = [
  aiTask({ id: 1, type: "optimise_day", status: "ready", opCount: 2 }),
  aiTask({
    id: 2,
    type: "generate_packing",
    status: "ready",
    opCount: 8,
    tripName: "Rome",
    tripId: 6,
  }),
];

function setup(pending = READY) {
  mockApi({
    "GET /ai-tasks/pending": ok(pending),
    "GET /itineraries/5/ai-tasks/1": ok(aiTaskDetail()),
    "GET /itineraries/5": ok(TRIP),
    "GET /itineraries/5/events": ok({ events: [EVENT] }),
  });
  return renderWithProviders(<ProposalsHost />);
}

describe("ProposalsHost", () => {
  it("lists every pending proposal in one popup", async () => {
    setup();

    const list = await screen.findByRole("list", {
      name: "Pending AI suggestions",
    });
    expect(within(list).getByText("Optimise days")).toBeInTheDocument();
    expect(within(list).getByText("Smart packing list")).toBeInTheDocument();
    expect(within(list).getByText(/Rome · 8 changes/)).toBeInTheDocument();
  });

  it("shows nothing when there is nothing to decide", async () => {
    setup([]);

    await waitFor(() =>
      expect(
        screen.queryByRole("list", { name: "Pending AI suggestions" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("opens a proposal for review and returns to the list afterwards", async () => {
    const user = userEvent.setup();
    setup();

    await user.click((await screen.findAllByRole("button", { name: "Review" }))[0]);
    expect(await screen.findByText("Dinner")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Decide later" }));

    // The one decided-later is hidden; the other is still waiting.
    expect(
      await screen.findByText("Smart packing list"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Optimise days")).not.toBeInTheDocument();
  });

  it("decide later hides all of them until the app is opened again", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(await screen.findByRole("button", { name: "Decide later" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("list", { name: "Pending AI suggestions" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("opens the proposal named in the link straight away", async () => {
    mockApi({
      "GET /ai-tasks/pending": ok(READY),
      "GET /itineraries/5/ai-tasks/1": ok(aiTaskDetail()),
      "GET /itineraries/5": ok(TRIP),
      "GET /itineraries/5/events": ok({ events: [EVENT] }),
    });

    renderWithProviders(<ProposalsHost />, { route: "/trips/5?aiTask=1" });

    expect(await screen.findByText("Dinner")).toBeInTheDocument();
  });
});
