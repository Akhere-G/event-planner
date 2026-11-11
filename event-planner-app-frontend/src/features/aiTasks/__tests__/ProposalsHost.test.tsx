import { beforeEach, describe, expect, it } from "vitest";
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
  }),
];

beforeEach(() => sessionStorage.clear());

function setup(pending = READY) {
  mockApi({
    "GET /itineraries/5/ai-tasks/pending": ok(pending),
    "GET /itineraries/5/ai-tasks/1": ok(aiTaskDetail()),
    "GET /itineraries/5": ok(TRIP),
    "GET /itineraries/5/events": ok({ events: [EVENT] }),
  });
  return renderWithProviders(<ProposalsHost tripId={5} />);
}

describe("ProposalsHost", () => {
  it("lists every pending proposal in one popup", async () => {
    setup();

    const list = await screen.findByRole("list", {
      name: "Pending AI suggestions",
    });
    expect(within(list).getByText("Optimise days")).toBeInTheDocument();
    expect(within(list).getByText("Smart packing list")).toBeInTheDocument();
    expect(within(list).getByText(/8 changes/)).toBeInTheDocument();
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

  it("decide later hides all of them, and stays hidden for the session", async () => {
    const user = userEvent.setup();
    const { unmount } = setup();

    await user.click(await screen.findByRole("button", { name: "Decide later" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("list", { name: "Pending AI suggestions" }),
      ).not.toBeInTheDocument(),
    );

    unmount();
    setup();

    await waitFor(() =>
      expect(
        screen.queryByRole("list", { name: "Pending AI suggestions" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("only hides the proposals that were dismissed", async () => {
    sessionStorage.setItem("dismissed_ai_proposals", "[1]");
    setup();

    expect(await screen.findByText("Smart packing list")).toBeInTheDocument();
    expect(screen.queryByText("Optimise days")).not.toBeInTheDocument();
  });

  it("opens the proposal named in the link straight away", async () => {
    mockApi({
      "GET /itineraries/5/ai-tasks/pending": ok(READY),
      "GET /itineraries/5/ai-tasks/1": ok(aiTaskDetail()),
      "GET /itineraries/5": ok(TRIP),
      "GET /itineraries/5/events": ok({ events: [EVENT] }),
    });

    renderWithProviders(<ProposalsHost tripId={5} />, {
      route: "/trips/5?aiTask=1",
    });

    expect(await screen.findByText("Dinner")).toBeInTheDocument();
  });
});
