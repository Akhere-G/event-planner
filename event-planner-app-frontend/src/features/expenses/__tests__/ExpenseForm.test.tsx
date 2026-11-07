import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import type { Trip } from "../../trips/types";
import ExpenseForm from "../components/ExpenseForm";

// The trip snapshot is stale: the event below was added after it was fetched.
const trip = {
  id: 1,
  role: "admin",
  timezone: "Europe/London",
  userMemberships: [{ id: 5, username: "sam" }],
  events: [],
} as unknown as Trip;

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
});
