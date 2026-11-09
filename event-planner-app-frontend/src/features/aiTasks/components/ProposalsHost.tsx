import { useState } from "react";
import { useSearchParams } from "react-router";
import { usePendingProposals } from "../hooks";
import type { AiTask } from "../types";
import ProposalReviewModal from "./ProposalReviewModal";
import ProposalsPopup from "./ProposalsPopup";

export const REVIEW_PARAM = "aiTask";

/**
 * Opens the pending-proposals popup whenever a task has finished, on any page.
 * Mount it once for a signed-in user, and per trip for an anonymous visitor
 * (who has no account to look proposals up by).
 */
export default function ProposalsHost({
  anonymousTripId,
}: {
  anonymousTripId?: number;
}) {
  const proposals = usePendingProposals(anonymousTripId);
  const [searchParams, setSearchParams] = useSearchParams();
  // "Decide later" hides a proposal until the app is next opened.
  const [dismissed, setDismissed] = useState<ReadonlySet<number>>(new Set());
  const [reviewing, setReviewing] = useState<AiTask | null>(null);

  const requestedId = Number(searchParams.get(REVIEW_PARAM));
  const requested = proposals.find((task) => task.id === requestedId);
  const current = reviewing ?? requested ?? null;
  const visible = proposals.filter((task) => !dismissed.has(task.id));

  const dismiss = (ids: number[]) =>
    setDismissed((existing) => new Set([...existing, ...ids]));

  const closeReview = (task: AiTask, decided: boolean) => {
    if (!decided) dismiss([task.id]);
    setReviewing(null);
    if (searchParams.has(REVIEW_PARAM)) {
      setSearchParams(
        (existing) => {
          const next = new URLSearchParams(existing);
          next.delete(REVIEW_PARAM);
          return next;
        },
        { replace: true },
      );
    }
  };

  if (current) {
    return (
      <ProposalReviewModal
        tripId={current.tripId}
        taskId={current.id}
        onClose={(decided) => closeReview(current, decided)}
      />
    );
  }

  if (visible.length === 0) return null;

  return (
    <ProposalsPopup
      proposals={visible}
      onReview={setReviewing}
      onDecideLater={() => dismiss(visible.map((task) => task.id))}
    />
  );
}
