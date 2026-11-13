import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { mockApi } from "../../../test-utils/mockApi";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import GoogleCalendarSettings from "../components/GoogleCalendarSettings";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const status = (connected: boolean) => ({
  success: true,
  data: { connected, syncedTripIds: [] },
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("GoogleCalendarSettings", () => {
  it("offers to connect when no account is linked", async () => {
    mockApi({ "GET /calendar/google/status": status(false) });
    renderWithProviders(<GoogleCalendarSettings />);

    expect(
      await screen.findByRole("button", { name: "Connect Google Calendar" }),
    ).toBeInTheDocument();
  });

  it("sends the user to Google's consent page", async () => {
    const assign = vi.fn();
    vi.stubGlobal("location", { ...window.location, assign });
    mockApi({
      "GET /calendar/google/status": status(false),
      "POST /calendar/google/connect": {
        success: true,
        data: { url: "https://accounts.google.com/consent" },
      },
    });
    renderWithProviders(<GoogleCalendarSettings />);

    await userEvent.click(
      await screen.findByRole("button", { name: "Connect Google Calendar" }),
    );

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith(
        "https://accounts.google.com/consent",
      ),
    );
  });

  it("disconnects a linked account and says so", async () => {
    const { requests } = mockApi({
      "GET /calendar/google/status": status(true),
      "DELETE /calendar/google/connection": { success: true, data: null },
    });
    renderWithProviders(<GoogleCalendarSettings />);

    await userEvent.click(
      await screen.findByRole("button", { name: "Disconnect" }),
    );

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Google Calendar disconnected.",
      ),
    );
    expect(requests.map((r) => `${r.method} ${r.path}`)).toContain(
      "DELETE /calendar/google/connection",
    );
  });

  it("shows the API message when disconnecting fails", async () => {
    mockApi({
      "GET /calendar/google/status": status(true),
      "DELETE /calendar/google/connection": new Response(
        JSON.stringify({ success: false, message: "Google is unreachable." }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      ),
    });
    renderWithProviders(<GoogleCalendarSettings />);

    await userEvent.click(
      await screen.findByRole("button", { name: "Disconnect" }),
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Google is unreachable."),
    );
  });

  it.each([
    ["connected", "success", "Google Calendar connected."],
    ["failed", "error", "Could not connect Google Calendar. Please try again."],
  ] as const)(
    "reports the %s redirect result once",
    async (result, kind, message) => {
      mockApi({ "GET /calendar/google/status": status(false) });
      renderWithProviders(<GoogleCalendarSettings />, {
        route: `/settings?calendar=${result}`,
      });

      await waitFor(() => expect(toast[kind]).toHaveBeenCalledWith(message));
      expect(toast[kind]).toHaveBeenCalledTimes(1);
    },
  );
});
