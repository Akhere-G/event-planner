import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import { mockFetchSequence } from "../../../test-utils/mockFetch";
import { anonymousAccessCodeStorageKey } from "../../api/apiSlice";
import { TripBuilderChat } from "../components";

vi.mock("@posthog/react", () => ({ usePostHog: () => undefined }));

const ok = (data: unknown) => ({
  body: { success: true, message: "ok", data },
});

const question = ok({
  reply: "When are you travelling?",
  missing: ["startDate", "endDate"],
  preferencesSoFar: { destination: "Paris, France" },
});

const draft = ok({
  reply: "Here is a draft for Paris.",
  draft: {
    trip: {
      name: "Paris break",
      destination: "Paris, France",
      latitude: 48.86,
      longitude: 2.33,
      startDate: "2026-08-01",
      endDate: "2026-08-03",
    },
    preferences: { tripType: "couple" },
    timezone: "Europe/Paris",
    ops: [
      {
        op: "create",
        entity: "event",
        data: { name: "Louvre", startAt: "2026-08-01T08:00:00Z" },
      },
      { op: "create", entity: "accommodation", data: { name: "Hotel Paris" } },
      { op: "create", entity: "packing_item", data: { name: "Umbrella" } },
      { op: "create", entity: "wishlist_item", data: { name: "Seine cruise" } },
    ],
  },
});

const created = ok({
  id: 42,
  name: "Paris break",
  anonymousAccessCode: "secret-code",
});

function renderChat() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<TripBuilderChat />} />
      <Route path="/trips/:id" element={<p>Trip page</p>} />
    </Routes>,
  );
}

async function say(text: string) {
  await userEvent.type(
    screen.getByRole("textbox", { name: /describe your trip/i }),
    text,
  );
  await userEvent.click(screen.getByRole("button", { name: "Send message" }));
}

describe("TripBuilderChat", () => {
  it("asks follow-up questions, then previews a draft that Create trip saves", async () => {
    const fetchMock = mockFetchSequence([question, draft, created]);
    renderChat();

    await userEvent.click(
      screen.getByRole("button", { name: /relaxed week in lisbon/i }),
    );
    expect(await screen.findByText("When are you travelling?")).toBeVisible();
    expect(screen.queryByLabelText("Draft trip")).not.toBeInTheDocument();

    await say("1 to 3 August");
    const preview = await screen.findByLabelText("Draft trip");
    expect(preview).toHaveTextContent("Paris break");
    expect(preview).toHaveTextContent("Louvre");
    expect(preview).toHaveTextContent("Hotel Paris");
    expect(preview).toHaveTextContent("Umbrella");
    expect(preview).toHaveTextContent("Seine cruise");

    const chatCall = fetchMock.mock.calls[1][0] as Request;
    expect(await chatCall.json()).toMatchObject({
      message: "1 to 3 August",
      history: [
        { role: "user" },
        { role: "assistant", content: "When are you travelling?" },
      ],
    });

    await userEvent.click(screen.getByRole("button", { name: "Create trip" }));

    expect(await screen.findByText("Trip page")).toBeInTheDocument();
    const createCall = fetchMock.mock.calls[2][0] as Request;
    expect(createCall.url).toContain("/itineraries/from-draft");
    expect(await createCall.json()).toMatchObject({
      trip: { destination: "Paris, France" },
      preferences: { tripType: "couple" },
    });
    expect(
      JSON.parse(localStorage.getItem(anonymousAccessCodeStorageKey) ?? "{}"),
    ).toEqual({ anonymousAccessCode: "secret-code", tripId: 42 });
  });

  it("hides the draft when you keep refining", async () => {
    mockFetchSequence([draft]);
    renderChat();

    await say("Paris in August");
    await userEvent.click(
      await screen.findByRole("button", { name: "Keep refining" }),
    );

    await waitFor(() =>
      expect(screen.queryByLabelText("Draft trip")).not.toBeInTheDocument(),
    );
  });
});
