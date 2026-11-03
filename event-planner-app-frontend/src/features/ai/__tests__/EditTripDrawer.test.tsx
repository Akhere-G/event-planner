import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "sonner";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import {
  mockFetchError,
  mockFetchSequence,
} from "../../../test-utils/mockFetch";
import EditTripDrawer from "../components/EditTripDrawer";
import TripDetails from "../../trips/components/TripDetails";
import type { Trip } from "../../trips/types";

vi.mock("../../trips/components/TripSummary", () => ({ default: () => null }));
vi.mock("../../trips/components/TripActivities", () => ({
  default: () => null,
}));
vi.mock("../../accommodations/components/AccommodationPage", () => ({
  default: () => null,
}));
vi.mock("../../packing/components", () => ({ PackingPage: () => null }));

const trip: Trip = {
  id: 5,
  name: "Paris",
  destination: "Paris",
  latitude: 48.8,
  longitude: 2.3,
  role: "editor",
  timezone: "Europe/Paris",
  startDate: "2026-08-20",
  endDate: "2026-08-22",
  userMemberships: [],
  events: [],
  invites: [],
  createdAt: "2026-01-01T00:00:00Z",
  anonymousAccessCode: null,
};

const previewResponse = {
  success: true,
  message: "ok",
  data: {
    reply: "I'll move dinner to 7pm.",
    ops: [
      {
        op: "update",
        entity: "event",
        id: 9,
        data: {
          name: "Dinner",
          startAt: "2026-08-20T17:00:00Z",
          endAt: "2026-08-20T19:00:00Z",
        },
        reason: "You asked for 7pm.",
      },
    ],
  },
};

async function sendMessage(text: string) {
  await userEvent.click(screen.getByRole("button", { name: "Ask AI to edit" }));
  await userEvent.type(
    await screen.findByRole("textbox", { name: /describe the change/i }),
    text,
  );
  await userEvent.click(screen.getByRole("button", { name: "Send message" }));
}

describe("EditTripDrawer", () => {
  it("shows the AI reply and opens the preview; nothing is applied until confirmed", async () => {
    const fetchMock = mockFetchSequence([
      { body: previewResponse },
      {
        body: {
          success: true,
          message: "ok",
          data: { created: 0, updated: 1, deleted: 0 },
        },
      },
    ]);
    renderWithProviders(
      <>
        <Toaster />
        <EditTripDrawer trip={trip} />
      </>,
    );

    await sendMessage("move dinner to 7pm");

    expect(
      await screen.findByText("I'll move dinner to 7pm."),
    ).toBeInTheDocument();
    expect(await screen.findByText("Review AI changes")).toBeInTheDocument();
    expect(screen.getByText("You asked for 7pm.")).toBeInTheDocument();

    expect(String((fetchMock.mock.calls[0][0] as Request).url)).toContain(
      "/ai/edit-trip/5/preview",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await userEvent.click(
      screen.getByRole("button", { name: /apply 1 change/i }),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(String((fetchMock.mock.calls[1][0] as Request).url)).toContain(
      "/itineraries/5/changes/apply",
    );
  });

  it("shows a clarifying reply without opening the preview", async () => {
    mockFetchSequence([
      {
        body: {
          success: true,
          message: "ok",
          data: { reply: "Which dinner do you mean?", ops: [] },
        },
      },
    ]);
    renderWithProviders(<EditTripDrawer trip={trip} />);

    await sendMessage("move dinner");

    expect(
      await screen.findByText("Which dinner do you mean?"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Review AI changes")).not.toBeInTheDocument();
  });

  it("toasts when the AI request fails", async () => {
    mockFetchError("The AI could not process that request.", 502);
    renderWithProviders(
      <>
        <Toaster />
        <EditTripDrawer trip={trip} />
      </>,
    );

    await sendMessage("do something");

    expect(
      await screen.findByText("The AI could not process that request."),
    ).toBeInTheDocument();
  });
});

describe("TripDetails ask-AI entry point", () => {
  it.each([
    ["admin", true],
    ["editor", true],
    ["viewer", false],
  ])("for %s the button visible is %s", (role, visible) => {
    renderWithProviders(<TripDetails {...trip} role={role} />);
    const button = screen.queryByRole("button", { name: "Ask AI to edit" });
    expect(Boolean(button)).toBe(visible);
  });
});
