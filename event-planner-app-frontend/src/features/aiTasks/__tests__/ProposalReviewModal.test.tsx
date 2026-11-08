import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "sonner";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import { mockApi } from "../../../test-utils/mockApi";
import ProposalReviewModal from "../components/ProposalReviewModal";
import { aiTaskDetail, EVENT, ok, TRIP } from "./fixtures";
import type { AiTaskDetail } from "../types";

function setup(detail: AiTaskDetail, extra: Record<string, unknown> = {}) {
  const api = mockApi({
    "GET /itineraries/5/ai-tasks/1": ok(detail),
    "GET /itineraries/5": ok(TRIP),
    "GET /itineraries/5/events": ok({ events: [EVENT] }),
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
        skippedOutdated: 0,
      }),
    });

    await user.click(await screen.findByRole("checkbox", { name: /Remove/ }));
    await user.click(screen.getByRole("button", { name: "Apply 1 change" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledWith(true));
    const accept = requests.find((r) => r.path.endsWith("/accept"));
    expect(accept?.body).toEqual({ opIndexes: [0] });
    expect(await screen.findByText("Changes applied: 1 added.")).toBeInTheDocument();
  });

  it("mentions changes skipped because the trip moved on", async () => {
    const user = userEvent.setup();
    setup(aiTaskDetail(), {
      "POST /itineraries/5/ai-tasks/1/accept": ok({
        applied: { created: 1, updated: 0, deleted: 0 },
        skippedOutdated: 1,
      }),
    });

    await user.click(await screen.findByRole("button", { name: "Apply 2 changes" }));

    expect(
      await screen.findByText(/1 skipped because they changed since/),
    ).toBeInTheDocument();
  });

  it("disables changes whose target was edited since", async () => {
    setup(aiTaskDetail({ outdatedOpIndexes: [1] }));

    const outdated = await screen.findByRole("checkbox", { name: /Remove/ });

    expect(outdated).toBeDisabled();
    expect(outdated).not.toBeChecked();
    expect(screen.getByText("Changed since")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Apply 1 change" }),
    ).toBeEnabled();
  });

  it("rejects the proposal", async () => {
    const user = userEvent.setup();
    const { requests, onClose } = setup(aiTaskDetail(), {
      "POST /itineraries/5/ai-tasks/1/reject": ok({}),
    });

    await user.click(await screen.findByRole("button", { name: "Reject" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledWith(true));
    expect(requests.some((r) => r.path.endsWith("/reject"))).toBe(true);
  });

  it("leaves the proposal pending when the user decides later", async () => {
    const user = userEvent.setup();
    const { requests, onClose } = setup(aiTaskDetail());

    await user.click(await screen.findByRole("button", { name: "Decide later" }));

    expect(onClose).toHaveBeenCalledWith(false);
    expect(requests.filter((r) => r.method === "POST")).toEqual([]);
  });

  it("shows the API error and stays open when accepting fails", async () => {
    const user = userEvent.setup();
    const { onClose } = setup(aiTaskDetail());
    // The accept route is not mocked, so the 404 body is shown.

    await user.click(await screen.findByRole("button", { name: "Apply 2 changes" }));

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
