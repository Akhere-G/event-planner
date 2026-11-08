import { useState } from "react";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";
import { ConfirmModal, StateGate } from "../../../components";
import { ChangePreviewList } from "../../ai/components";
import { summariseApplied } from "../../ai/utils";
import { isApiError } from "../../api/utils";
import useTripEvents from "../../events/hooks/useTripEvents";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";
import {
  useAcceptAiTaskMutation,
  useGetAiTaskQuery,
  useRejectAiTaskMutation,
} from "../services/aiTaskApiSlice";
import type { AiTaskDetail, AiTaskType } from "../types";
import { TASK_LABELS } from "../utils";

const ANALYTICS_EVENTS: Record<AiTaskType, string> = {
  fill_day: "ai_fill_days_generated",
  optimise_day: "ai_optimise_events_used",
  generate_trip: "ai_trip_generated",
  generate_packing: "packing_items_generated",
};

interface ProposalReviewModalProps {
  tripId: number;
  taskId: number;
  /** `decided` is false when the user chose to decide later. */
  onClose: (decided: boolean) => void;
}

/** Opens a finished task's proposal so the user can accept some or all of it, or reject it. */
export default function ProposalReviewModal({
  tripId,
  taskId,
  onClose,
}: ProposalReviewModalProps) {
  const task = useGetAiTaskQuery({ tripId, taskId });
  const trip = useGetTripQuery(tripId);
  const { events } = useTripEvents(tripId);
  const detail = task.data?.data;
  const timezone = trip.data?.data.timezone;

  return (
    <ConfirmModal
      open
      onOpenChange={(open) => !open && onClose(false)}
      title={detail ? `${TASK_LABELS[detail.type]}: review changes` : "Review changes"}
      description={
        detail
          ? `Proposed for ${detail.tripName}. Nothing is saved until you apply them.`
          : undefined
      }
      hideButtons
    >
      <StateGate
        loadingStateProps={{ isLoading: task.isLoading || trip.isLoading }}
        errorStateProps={{ isError: task.isError || trip.isError }}
      >
        {detail && timezone && (
          <ProposalReview
            key={detail.id}
            task={detail}
            events={events}
            timezone={timezone}
            onClose={onClose}
          />
        )}
      </StateGate>
    </ConfirmModal>
  );
}

function ProposalReview({
  task,
  events,
  timezone,
  onClose,
}: {
  task: AiTaskDetail;
  events: Parameters<typeof ChangePreviewList>[0]["events"];
  timezone: string;
  onClose: (decided: boolean) => void;
}) {
  const posthog = usePostHog();
  const [acceptTask, { isLoading: isAccepting }] = useAcceptAiTaskMutation();
  const [rejectTask, { isLoading: isRejecting }] = useRejectAiTaskMutation();

  const outdated = new Set(task.outdatedOpIndexes);
  const [selected, setSelected] = useState<Set<number>>(
    () =>
      new Set(
        task.ops.flatMap((_, index) => (outdated.has(index) ? [] : [index])),
      ),
  );

  const isBusy = isAccepting || isRejecting;

  if (task.status !== "ready") {
    return (
      <div className="flex flex-col gap-4 p-4">
        <p className="text-text-secondary">
          {task.status === "expired"
            ? "This proposal has expired."
            : "This proposal has already been dealt with."}
        </p>
        <button className="btn-secondary self-end" onClick={() => onClose(true)}>
          Close
        </button>
      </div>
    );
  }

  const toggle = (index: number) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const handleAccept = async () => {
    try {
      const { data } = await acceptTask({
        tripId: task.tripId,
        taskId: task.id,
        opIndexes: [...selected].sort((a, b) => a - b),
      }).unwrap();
      const skipped = data.skippedOutdated
        ? ` ${data.skippedOutdated} skipped because they changed since.`
        : "";
      toast.success(summariseApplied(data.applied) + skipped);
      posthog?.capture(ANALYTICS_EVENTS[task.type], { trip_id: task.tripId });
      onClose(true);
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.data.message);
      } else {
        posthog?.captureException(err);
        toast.error("Could not apply the changes.");
      }
    }
  };

  const handleReject = async () => {
    try {
      await rejectTask({ tripId: task.tripId, taskId: task.id }).unwrap();
      toast.success("Suggestions dismissed.");
      onClose(true);
    } catch (err) {
      toast.error(
        isApiError(err) ? err.data.message : "Could not dismiss the suggestions.",
      );
    }
  };

  return (
    <>
      <ChangePreviewList
        ops={task.ops}
        events={events}
        timezone={timezone}
        selected={selected}
        outdated={outdated}
        onToggle={toggle}
      />
      <div className="flex flex-wrap justify-end gap-2 border-t border-surface-border p-4">
        <button
          className="btn-secondary"
          disabled={isBusy}
          onClick={() => onClose(false)}
        >
          Decide later
        </button>
        <button className="btn-error" disabled={isBusy} onClick={handleReject}>
          Reject
        </button>
        <button
          className="btn-primary px-4"
          disabled={isBusy || selected.size === 0}
          onClick={handleAccept}
        >
          {selected.size === 0
            ? "Select changes"
            : `Apply ${selected.size} ${selected.size === 1 ? "change" : "changes"}`}
        </button>
      </div>
    </>
  );
}
