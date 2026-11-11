import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "sonner";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import { mockApi } from "../../../test-utils/mockApi";
import { mockFetchError } from "../../../test-utils/mockFetch";
import EditTripDrawer from "../components/EditTripDrawer";
import type { Trip } from "../../trips/types";
import {
  aiTask,
  aiTaskDetail,
  EVENT,
  ok,
  TRIP,
} from "../../aiTasks/__tests__/fixtures";

const PROPOSAL = aiTask({
  id: 1,
  type: "edit_trip",
  status: "ready",
  opCount: 2,
});

const ROUTES = {
  "GET /itineraries/5/ai-tasks/1": ok(
    aiTaskDetail({ type: "edit_trip", params: { message: "Dinner at 7" } }),
  ),
  "GET /itineraries/5": ok(TRIP),
  "GET /itineraries/5/events": ok({ events: [EVENT] }),
  "POST /itineraries/5/ai-tasks/1/accept": ok({
    applied: { created: 1, updated: 0, deleted: 1 },
    skippedUnavailable: 0,
  }),
};

async function openDrawer() {
  const user = userEvent.setup();
  renderWithProviders(
    <>
      <Toaster />
      <EditTripDrawer trip={TRIP as unknown as Trip} />
    </>,
  );
  await user.click(screen.getByRole("button", { name: "Ask AI to edit" }));
  return user;
}

async function send(user: ReturnType<typeof userEvent.setup>, text: string) {
  await user.type(
    await screen.findByRole("textbox", { name: "Message" }),
    text,
  );
  await user.click(screen.getByRole("button", { name: "Send message" }));
}

describe("EditTripDrawer", () => {
  it("shows the assistant's reply with a way to review the proposed changes", async () => {
    const { requests } = mockApi({
      ...ROUTES,
      "POST /ai/edit-trip/5": ok({ reply: "Moved it to 7pm.", task: PROPOSAL }),
    });
    const user = await openDrawer();

    await send(user, "Move dinner to 7pm");

    const log = await screen.findByRole("log", { name: "Edit conversation" });
    expect(
      await within(log).findByText("Moved it to 7pm."),
    ).toBeInTheDocument();
    expect(
      within(log).getByRole("button", { name: "Review 2 changes" }),
    ).toBeInTheDocument();
    const call = requests.find((r) => r.path === "/ai/edit-trip/5");
    expect(call?.body).toEqual({ message: "Move dinner to 7pm", history: [] });
    expect(requests.some((r) => r.path.endsWith("/accept"))).toBe(false);
  });

  it("applies the changes through the proposal's accept endpoint", async () => {
    const { requests } = mockApi({
      ...ROUTES,
      "POST /ai/edit-trip/5": ok({ reply: "Moved it to 7pm.", task: PROPOSAL }),
    });
    const user = await openDrawer();
    await send(user, "Move dinner to 7pm");

    await user.click(
      await screen.findByRole("button", { name: "Review 2 changes" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Apply 2 changes" }),
    );

    await waitFor(() =>
      expect(requests.find((r) => r.path.endsWith("/accept"))?.body).toEqual({
        opIndexes: [0, 1],
      }),
    );
    expect(await screen.findByText("Reviewed")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Review 2 changes" }),
    ).not.toBeInTheDocument();
  });

  it("offers no review for a clarifying reply", async () => {
    mockApi({
      "POST /ai/edit-trip/5": ok({
        reply: "Which dinner do you mean?",
        task: null,
      }),
    });
    const user = await openDrawer();

    await send(user, "Move dinner");

    expect(
      await screen.findByText("Which dinner do you mean?"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Review/ }),
    ).not.toBeInTheDocument();
  });

  it("sends the earlier conversation with the next message", async () => {
    const { requests } = mockApi({
      "POST /ai/edit-trip/5": ok({
        reply: "Which dinner do you mean?",
        task: null,
      }),
    });
    const user = await openDrawer();
    await send(user, "Move dinner");
    await screen.findByText("Which dinner do you mean?");

    await send(user, "The one on Friday");

    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[1].body).toEqual({
      message: "The one on Friday",
      history: [
        { role: "user", content: "Move dinner" },
        { role: "assistant", content: "Which dinner do you mean?" },
      ],
    });
  });

  it("shows the API's error message when the request fails", async () => {
    mockFetchError("The AI could not process that request.", 502);
    const user = await openDrawer();

    await send(user, "Move dinner");

    expect(
      await screen.findByText("The AI could not process that request."),
    ).toBeInTheDocument();
  });
});
