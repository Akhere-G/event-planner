import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
} from "../../../components/ui/dropdown-menu";
import { mockApi } from "../../../test-utils/mockApi";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import TripSyncMenuItem from "../components/TripSyncMenuItem";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const status = (connected: boolean, syncedTripIds: number[] = []) => ({
  success: true,
  data: { connected, syncedTripIds },
});

function renderItem() {
  return renderWithProviders(
    <DropdownMenu open>
      <DropdownMenuContent>
        <TripSyncMenuItem tripId={4} />
      </DropdownMenuContent>
    </DropdownMenu>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("TripSyncMenuItem", () => {
  it("is disabled until Google Calendar is connected", async () => {
    mockApi({ "GET /calendar/google/status": status(false) });
    renderItem();

    const item = await screen.findByRole("menuitem", {
      name: "Sync to Google Calendar",
    });
    expect(item).toHaveAttribute("aria-disabled", "true");
  });

  it("switches sync on for the trip", async () => {
    const { requests } = mockApi({
      "GET /calendar/google/status": status(true),
      "PUT /calendar/google/trips/4": { success: true, data: null },
    });
    renderItem();

    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Sync to Google Calendar" }),
    );

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Syncing this trip to Google Calendar.",
      ),
    );
    expect(requests.map((r) => `${r.method} ${r.path}`)).toContain(
      "PUT /calendar/google/trips/4",
    );
  });

  it("switches sync off for a synced trip", async () => {
    mockApi({
      "GET /calendar/google/status": status(true, [4]),
      "DELETE /calendar/google/trips/4": { success: true, data: null },
    });
    renderItem();

    await userEvent.click(
      await screen.findByRole("menuitem", {
        name: "Stop syncing to Google Calendar",
      }),
    );

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Stopped syncing this trip to Google Calendar.",
      ),
    );
  });

  it("falls back to a generic message when the error has none", async () => {
    mockApi({
      "GET /calendar/google/status": status(true),
      "PUT /calendar/google/trips/4": new Response("nope", { status: 500 }),
    });
    renderItem();

    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Sync to Google Calendar" }),
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Could not update Google Calendar sync.",
      ),
    );
  });
});
