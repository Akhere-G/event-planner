import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import { mockApi } from "../../../test-utils/mockApi";
import { anonymousAccessCodeStorageKey } from "../../api/apiSlice";
import TripPromptForm from "../components/TripPromptForm";
import { PLANNING_STARTED_MESSAGE } from "../constants";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => navigate,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const TRIP = {
  id: 7,
  name: "Lisbon food weekend",
  destination: "Lisbon, Portugal",
  startDate: "2026-06-05",
  endDate: "2026-06-08",
  anonymousAccessCode: null,
};
const PROMPT = "A foodie weekend in Lisbon";

beforeEach(() => vi.clearAllMocks());

async function sendPrompt(text = PROMPT) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/describe your trip/i), text);
  await user.click(screen.getByRole("button", { name: "Plan my trip" }));
}

describe("TripPromptForm", () => {
  it("creates the trip from the prompt and opens it", async () => {
    const { requests } = mockApi({
      "POST /itineraries/from-prompt": { success: true, data: TRIP },
    });
    renderWithProviders(<TripPromptForm disabled={false} />);

    await sendPrompt();

    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/trips/7"));
    expect(requests[0].body).toEqual({ prompt: PROMPT });
    expect(toast.success).toHaveBeenCalledWith(PLANNING_STARTED_MESSAGE);
    expect(localStorage.getItem(anonymousAccessCodeStorageKey)).toBeNull();
  });

  it("remembers the access code of a trip made while logged out", async () => {
    mockApi({
      "POST /itineraries/from-prompt": {
        success: true,
        data: { ...TRIP, anonymousAccessCode: "secret" },
      },
    });
    renderWithProviders(<TripPromptForm disabled={false} />);

    await sendPrompt();

    await waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(
      JSON.parse(localStorage.getItem(anonymousAccessCodeStorageKey) ?? "{}"),
    ).toEqual({ anonymousAccessCode: "secret", tripId: 7 });
  });

  it("shows what the server could not understand under the prompt", async () => {
    mockApi({
      "POST /itineraries/from-prompt": () =>
        Response.json(
          { success: false, error: { prompt: ["Say where you'd like to go."] } },
          { status: 400 },
        ),
    });
    renderWithProviders(<TripPromptForm disabled={false} />);

    await sendPrompt("Somewhere nice");

    expect(
      await screen.findByText("Say where you'd like to go."),
    ).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("toasts the API message when the request fails otherwise", async () => {
    mockApi({
      "POST /itineraries/from-prompt": () =>
        Response.json(
          { success: false, message: "Rate limit exceeded: 3 per 1 hour" },
          { status: 429 },
        ),
    });
    renderWithProviders(<TripPromptForm disabled={false} />);

    await sendPrompt();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Rate limit exceeded: 3 per 1 hour",
      ),
    );
    expect(navigate).not.toHaveBeenCalled();
  });

  it("asks for a prompt instead of sending an empty one", async () => {
    const { fetchMock } = mockApi({});
    renderWithProviders(<TripPromptForm disabled={false} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Plan my trip" }));

    expect(
      await screen.findByText("Describe the trip you'd like."),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("can be disabled", () => {
    renderWithProviders(<TripPromptForm disabled />);

    expect(screen.getByRole("button", { name: "Plan my trip" })).toBeDisabled();
  });
});
