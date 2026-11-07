import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "sonner";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import { mockFetchError, mockFetchOnce } from "../../../test-utils/mockFetch";
import ChangePreviewModal from "../components/ChangePreviewModal";
import type { ChangeOp } from "../types";

const ops: ChangeOp[] = [
  {
    op: "create",
    entity: "event",
    data: {
      name: "Dinner",
      address: "1 Rue Cler",
      startAt: "2026-08-20T17:00:00Z",
      endAt: "2026-08-20T19:00:00Z",
    },
    reason: "Close to your hotel.",
  },
  {
    op: "create",
    entity: "event",
    data: {
      name: "Museum",
      address: "Rue de Rivoli",
      startAt: "2026-08-20T08:00:00Z",
      endAt: "2026-08-20T10:00:00Z",
    },
  },
];

function renderModal(onOpenChange = vi.fn(), onApplied = vi.fn()) {
  renderWithProviders(
    <>
      <Toaster />
      <ChangePreviewModal
        open
        onOpenChange={onOpenChange}
        tripId={5}
        timezone="Europe/Paris"
        ops={ops}
        events={[]}
        title="Fill Day 1: review suggestions"
        onApplied={onApplied}
      />
    </>,
  );
  return { onOpenChange, onApplied };
}

describe("ChangePreviewModal", () => {
  it("lists every proposed change, selected by default, with its reason", () => {
    renderModal();

    expect(screen.getByText("Dinner")).toBeInTheDocument();
    expect(screen.getByText("Museum")).toBeInTheDocument();
    expect(screen.getByText("Close to your hotel.")).toBeInTheDocument();
    expect(screen.getByText("19:00–21:00 · 1 Rue Cler")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Apply 2 changes" }),
    ).toBeEnabled();
  });

  it("applies only the changes that are still selected", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetchOnce({
      success: true,
      data: { created: 1, updated: 0, deleted: 0 },
    });
    const { onOpenChange, onApplied } = renderModal();

    await user.click(screen.getByRole("checkbox", { name: "Add Museum" }));
    await user.click(screen.getByRole("button", { name: "Apply 1 change" }));

    await waitFor(() => expect(onApplied).toHaveBeenCalled());
    expect(onOpenChange).toHaveBeenCalledWith(false);

    const request = fetchMock.mock.calls[0][0] as Request;
    expect(request.url).toContain("/itineraries/5/changes/apply");
    expect(await request.json()).toEqual({ ops: [ops[0]] });
    expect(
      await screen.findByText("Changes applied: 1 added."),
    ).toBeInTheDocument();
  });

  it("disables apply when nothing is selected", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("checkbox", { name: "Add Dinner" }));
    await user.click(screen.getByRole("checkbox", { name: "Add Museum" }));

    expect(
      screen.getByRole("button", { name: "Select changes" }),
    ).toBeDisabled();
  });

  it("shows the API error and keeps the modal open when applying fails", async () => {
    const user = userEvent.setup();
    mockFetchError("Event not found.", 404);
    const { onOpenChange, onApplied } = renderModal();

    await user.click(screen.getByRole("button", { name: "Apply 2 changes" }));

    expect(await screen.findByText("Event not found.")).toBeInTheDocument();
    expect(onApplied).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});

describe("ChangePreviewModal cost estimates", () => {
  it("shows a cost chip and price tier on rows that carry an estimate", () => {
    const estimated: ChangeOp[] = [
      {
        op: "create",
        entity: "event",
        data: {
          name: "Dinner",
          address: "1 Rue Cler",
          startAt: "2026-08-20T17:00:00Z",
          endAt: "2026-08-20T19:00:00Z",
          estimatedCostGbp: 24.5,
          priceTier: 2,
        },
      },
      {
        op: "update",
        entity: "event",
        id: 3,
        data: { estimatedCostGbp: 10, priceTier: 1 },
      },
      {
        op: "create",
        entity: "event",
        data: {
          name: "Walk",
          startAt: "2026-08-20T08:00:00Z",
          endAt: "2026-08-20T09:00:00Z",
        },
      },
    ];

    renderWithProviders(
      <ChangePreviewModal
        open
        onOpenChange={vi.fn()}
        tripId={5}
        timezone="Europe/Paris"
        ops={estimated}
        events={[]}
        title="Estimate costs"
      />,
    );

    expect(screen.getByText("~£24.50 pp")).toBeInTheDocument();
    expect(screen.getByLabelText("Price tier 2 of 4")).toHaveTextContent("££");
    expect(screen.getByText("~£10 pp")).toBeInTheDocument();
    expect(screen.getByText("Cost estimate")).toBeInTheDocument();
    expect(screen.getAllByText(/pp$/)).toHaveLength(2);
  });
});
