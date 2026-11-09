import { useState } from "react";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";
import { StateGate } from "../../../components";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import type { ChangeStaleness } from "../../ai/components/ChangePreviewList";
import type { ChangeEntity } from "../../ai/types";
import { groupOpsByEntity, summariseApplied } from "../../ai/utils";
import { isApiError } from "../../api/utils";
import type { Event } from "../../events/types";
import useTripEvents from "../../events/hooks/useTripEvents";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";
import {
  useAcceptAiTaskMutation,
  useGetAiTaskQuery,
  useRejectAiTaskMutation,
} from "../services/aiTaskApiSlice";
import type { AiTaskDetail, AiTaskType } from "../types";
import ProposalAreaSection from "./ProposalAreaSection";
import ProposalFilterTabs, { type ProposalFilter } from "./ProposalFilterTabs";
import ProposalFooter from "./ProposalFooter";
import ProposalSummary from "./ProposalSummary";

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
    <Dialog open onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="flex max-h-[92vh] w-full flex-col gap-0 overflow-scroll p-0 max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full! max-sm:translate-y-0 max-sm:rounded-b-none sm:w-[min(92vw,900px)]">
        <DialogHeader className="bg-brand-primary pl-4 py-4">
          <DialogTitle className="text-xl font-bold">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-text-inverse/80">
              AI suggestions ready
            </p>
            Review proposed changes
          </DialogTitle>
        </DialogHeader>
        <StateGate
          loadingStateProps={{ isLoading: task.isLoading || trip.isLoading }}
          errorStateProps={{ isError: task.isError || trip.isError }}
          containerClasses="p-6"
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
      </DialogContent>
    </Dialog>
  );
}

function ProposalReview({
  task,
  events,
  timezone,
  onClose,
}: {
  task: AiTaskDetail;
  events: Event[];
  timezone: string;
  onClose: (decided: boolean) => void;
}) {
  const posthog = usePostHog();
  const [acceptTask, { isLoading: isAccepting }] = useAcceptAiTaskMutation();
  const [rejectTask, { isLoading: isRejecting }] = useRejectAiTaskMutation();

  const staleness = new Map<number, ChangeStaleness>([
    ...task.changedOpIndexes.map((index) => [index, "changed"] as const),
    ...task.unavailableOpIndexes.map((index) => [index, "deleted"] as const),
  ]);
  const unavailableCount = task.unavailableOpIndexes.length;
  const applicableCount = task.ops.length - unavailableCount;

  // An edited target can still be applied, so only deleted ones start unticked.
  const [selected, setSelected] = useState<Set<number>>(
    () =>
      new Set(
        task.ops.flatMap((_, index) =>
          staleness.get(index) === "deleted" ? [] : [index],
        ),
      ),
  );
  const [filter, setFilter] = useState<ProposalFilter>("all");
  const areas = groupOpsByEntity(task.ops).map((group) => group.entity);
  const [openAreas, setOpenAreas] = useState<Set<ChangeEntity>>(
    () => new Set(areas.slice(0, 1)),
  );

  const isBusy = isAccepting || isRejecting;

  if (task.status !== "ready") {
    return (
      <div className="flex flex-col gap-4 p-6">
        <p className="text-text-secondary">
          {task.status === "expired"
            ? "This proposal has expired."
            : "This proposal has already been dealt with."}
        </p>
        <button
          className="btn-secondary self-end"
          onClick={() => onClose(true)}
        >
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

  const selectMany = (indexes: number[], select: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      indexes.forEach((index) =>
        select ? next.add(index) : next.delete(index),
      );
      return next;
    });

  const setAreaOpen = (entity: ChangeEntity, open: boolean) =>
    setOpenAreas((current) => {
      const next = new Set(current);
      if (open) next.add(entity);
      else next.delete(entity);
      return next;
    });

  const handleAccept = async () => {
    try {
      const { data } = await acceptTask({
        tripId: task.tripId,
        taskId: task.id,
        opIndexes: [...selected].sort((a, b) => a - b),
      }).unwrap();
      const skipped = data.skippedUnavailable
        ? ` ${data.skippedUnavailable} skipped because what they change was deleted.`
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
        isApiError(err)
          ? err.data.message
          : "Could not dismiss the suggestions.",
      );
    }
  };

  const visibleGroups = groupOpsByEntity(
    task.ops,
    filter === "all" ? undefined : filter,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ProposalSummary tripName={task.tripName} ops={task.ops} areas={areas} />
      <ProposalFilterTabs ops={task.ops} value={filter} onChange={setFilter} />
      <div className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-canvas p-5">
        <p className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface p-3 text-sm font-medium text-text-secondary">
          <Info size={16} className="shrink-0" />
          Select only the suggestions you want. Items changed while the AI was
          working are flagged for a second look.
        </p>
        {visibleGroups.length === 0 && (
          <p className="py-6 text-center text-text-secondary">
            No suggestions of this kind.
          </p>
        )}
        {visibleGroups.map(({ entity, items }) => (
          <ProposalAreaSection
            key={entity}
            entity={entity}
            items={items}
            events={events}
            timezone={timezone}
            selected={selected}
            staleness={staleness}
            isOpen={openAreas.has(entity)}
            onOpenChange={(open) => setAreaOpen(entity, open)}
            onToggle={toggle}
            onSelectAll={selectMany}
          />
        ))}
      </div>
      <ProposalFooter
        selectedCount={selected.size}
        skippedCount={applicableCount - selected.size}
        unavailableCount={unavailableCount}
        isBusy={isBusy}
        onDecideLater={() => onClose(false)}
        onReject={handleReject}
        onApply={handleAccept}
      />
    </div>
  );
}
