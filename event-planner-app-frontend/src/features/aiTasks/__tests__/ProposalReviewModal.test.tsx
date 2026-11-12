import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "sonner";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import { mockApi } from "../../../test-utils/mockApi";
import ProposalReviewModal from "../components/ProposalReviewModal";
import { aiTaskDetail, EVENT, ok, TRIP, USERS } from "./fixtures";
import type { AiTaskDetail } from "../types";

function setup(detail: AiTaskDetail, extra: Record<string, unknown> = {}) {
  const api = mockApi({
    "GET /itineraries/5/ai-tasks/1": ok(detail),
    "GET /itineraries/5": ok(TRIP),
    "GET /itineraries/5/events": ok({ events: [EVENT] }),
    "GET /itineraries/5/users": ok({ users: USERS }),
    ...extra,
  });
  const onClose = vi.fn();
  renderWithProviders(
    <>
      <Toaster />
      <ProposalReviewModal tripId={5} taskId={1} onClose={onClose} />
    </>,
  );
  return { ...api, onClose };
}

describe("ProposalReviewModal", () => {
  it("lists the proposed changes, all selected, with their reasons", async () => {
    setup(aiTaskDetail());

    expect(await screen.findByText("Dinner")).toBeInTheDocument();
    expect(screen.getByText("Close to your hotel.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Apply 2 changes" }),
    ).toBeEnabled();
  });

  it("accepts only the selected changes by index", async () => {
    const user = userEvent.setup();
    const { requests, onClose } = setup(aiTaskDetail(), {
      "POST /itineraries/5/ai-tasks/1/accept": ok({
        applied: { created: 1, updated: 0, deleted: 0 },
        skippedUnavailable: 0,
      }),
    });

    await user.click(await screen.findByRole("checkbox", { name: /Remove/ }));
    await user.click(screen.getByRole("button", { name: "Apply 1 change" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledWith(true));
    const accept = requests.find((r) => r.path.endsWith("/accept"));
    expect(accept?.body).toEqual({ opIndexes: [0] });
    expect(
      await screen.findByText("Changes applied: 1 added."),
    ).toBeInTheDocument();
  });

  it("mentions changes skipped because their target was deleted", async () => {
    const user = userEvent.setup();
    setup(aiTaskDetail(), {
      "POST /itineraries/5/ai-tasks/1/accept": ok({
        applied: { created: 1, updated: 0, deleted: 0 },
        skippedUnavailable: 1,
      }),
    });

    await user.click(
      await screen.findByRole("button", { name: "Apply 2 changes" }),
    );

    expect(
      await screen.findByText(/1 skipped because what they change was deleted/),
    ).toBeInTheDocument();
  });

  it("keeps a change to an edited item selectable, with an overwrite warning", async () => {
    const user = userEvent.setup();
    const { requests } = setup(aiTaskDetail({ changedOpIndexes: [1] }), {
      "POST /itineraries/5/ai-tasks/1/accept": ok({
        applied: { created: 1, updated: 0, deleted: 1 },
        skippedUnavailable: 0,
      }),
    });

    const edited = await screen.findByRole("checkbox", { name: /Remove/ });

    expect(edited).toBeEnabled();
    expect(edited).toBeChecked();
    expect(screen.getByText("Changed since")).toBeInTheDocument();
    expect(screen.getByText(/may overwrite those edits/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Apply 2 changes" }));
    await waitFor(() =>
      expect(requests.find((r) => r.path.endsWith("/accept"))?.body).toEqual({
        opIndexes: [0, 1],
      }),
    );
  });

  it("disables a change whose target was deleted", async () => {
    setup(aiTaskDetail({ unavailableOpIndexes: [1] }));

    const gone = await screen.findByRole("checkbox", { name: /Remove/ });

    expect(gone).toBeDisabled();
    expect(gone).not.toBeChecked();
    expect(screen.getByText("No longer available")).toBeInTheDocument();
    expect(
      screen.getByText(/1 unavailable suggestion won't be applied/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Apply 1 change" }),
    ).toBeEnabled();
  });

  it("summarises the proposal and filters it by kind", async () => {
    const user = userEvent.setup();
    setup(aiTaskDetail());

    expect(
      await screen.findByText("2 suggestions across 1 area"),
    ).toBeInTheDocument();
    const addFilter = await screen.findByRole("button", { name: /^Add\s*1$/ });

    await user.click(addFilter);

    expect(
      screen.getByRole("checkbox", { name: /Add Dinner/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: /Remove/ })).toBeNull();
  });

  it("clears and reselects a whole area", async () => {
    const user = userEvent.setup();
    setup(aiTaskDetail());

    await user.click(await screen.findByRole("button", { name: "Clear" }));
    expect(
      screen.getByRole("button", { name: "Select changes" }),
    ).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Select all" }));
    expect(
      screen.getByRole("button", { name: "Apply 2 changes" }),
    ).toBeEnabled();
  });

  it("opens only the first area to begin with", async () => {
    const user = userEvent.setup();
    setup(
      aiTaskDetail({
        ops: [
          ...aiTaskDetail().ops,
          {
            op: "create",
            entity: "packing_item",
            data: { name: "Rain jacket", category: "Clothing" },
          },
        ],
      }),
    );

    expect(await screen.findByText("Dinner")).toBeInTheDocument();
    expect(screen.queryByText("Rain jacket")).toBeNull();

    await user.click(screen.getByRole("button", { name: /^Packing/ }));

    expect(screen.getByText("Rain jacket")).toBeInTheDocument();
  });

  it("rejects the proposal", async () => {
    const user = userEvent.setup();
    const { requests, onClose } = setup(aiTaskDetail(), {
      "POST /itineraries/5/ai-tasks/1/reject": ok({}),
    });

    await user.click(await screen.findByRole("button", { name: "Reject all" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledWith(true));
    expect(requests.some((r) => r.path.endsWith("/reject"))).toBe(true);
  });

  it("leaves the proposal pending when the user decides later", async () => {
    const user = userEvent.setup();
    const { requests, onClose } = setup(aiTaskDetail());

    await user.click(
      await screen.findByRole("button", { name: "Decide later" }),
    );

    expect(onClose).toHaveBeenCalledWith(false);
    expect(requests.filter((r) => r.method === "POST")).toEqual([]);
  });

  it("shows the API error and stays open when accepting fails", async () => {
    const user = userEvent.setup();
    const { onClose } = setup(aiTaskDetail());
    // The accept route is not mocked, so the 404 body is shown.

    await user.click(
      await screen.findByRole("button", { name: "Apply 2 changes" }),
    );

    expect(await screen.findByText(/No mock for POST/)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("explains when the proposal can no longer be decided", async () => {
    setup(aiTaskDetail({ status: "expired" }));

    expect(
      await screen.findByText("This proposal has expired."),
    ).toBeInTheDocument();
  });
});
