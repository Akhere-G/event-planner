import { useState } from "react";
import { useSearchParams } from "react-router";
import {
  readDismissedProposals,
  saveDismissedProposals,
} from "../dismissedProposals";
import { usePendingProposals } from "../hooks";
import type { AiTask } from "../types";
import ProposalReviewModal from "./ProposalReviewModal";
import ProposalsPopup from "./ProposalsPopup";

export const REVIEW_PARAM = "aiTask";

export default function ProposalsHost({ tripId }: { tripId: number }) {
  const proposals = usePendingProposals(tripId);
  const [searchParams, setSearchParams] = useSearchParams();
  const [dismissed, setDismissed] = useState<ReadonlySet<number>>(
    () => new Set(readDismissedProposals()),
  );
  const [reviewing, setReviewing] = useState<AiTask | null>(null);

  const requestedId = Number(searchParams.get(REVIEW_PARAM));
  const requested = proposals.find((task) => task.id === requestedId);
  const current = reviewing ?? requested ?? null;
  const visible = proposals.filter((task) => !dismissed.has(task.id));

  const dismiss = (ids: number[]) => {
    const next = new Set([...dismissed, ...ids]);
    saveDismissedProposals([...next]);
    setDismissed(next);
  };

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
