import { useState } from "react";
import { AlertTriangle, LoaderCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { isApiError } from "../../api/utils";
import { useTripAiTasks } from "../hooks";
import {
  useCancelAiTaskMutation,
  useRejectAiTaskMutation,
  useRetryAiTaskMutation,
} from "../services/aiTaskApiSlice";
import type { AiTask } from "../types";
import {
  isActive,
  progressFraction,
  TASK_LABELS,
  TASK_PROGRESS_LABELS,
} from "../utils";
import ProposalReviewModal from "./ProposalReviewModal";

const errorMessage = (err: unknown, fallback: string) =>
  isApiError(err) ? err.data.message : fallback;

/** What the current user has running, waiting for review or failed on this trip. */
export default function TaskProgressCards({ tripId }: { tripId: number }) {
  const { tasks } = useTripAiTasks(tripId);
  const [reviewing, setReviewing] = useState<AiTask | null>(null);

  if (tasks.length === 0) return null;

  return (
    <>
      <ul className="flex flex-col gap-2" aria-label="AI tasks">
        {tasks.map((task) => (
          <li key={task.id}>
            {isActive(task) && <ActiveCard task={task} />}
            {task.status === "ready" && (
              <ReadyCard task={task} onReview={() => setReviewing(task)} />
            )}
            {task.status === "failed" && <FailedCard task={task} />}
          </li>
        ))}
      </ul>
      {reviewing && (
        <ProposalReviewModal
          tripId={tripId}
          taskId={reviewing.id}
          onClose={() => setReviewing(null)}
        />
      )}
    </>
  );
}

function ActiveCard({ task }: { task: AiTask }) {
  const [cancelTask, { isLoading }] = useCancelAiTaskMutation();
  const fraction = progressFraction(task);

  const handleCancel = async () => {
    try {
      await cancelTask({ tripId: task.tripId, taskId: task.id }).unwrap();
      toast.success(`${TASK_LABELS[task.type]} cancelled.`);
    } catch (err) {
      toast.error(errorMessage(err, "Could not cancel the task."));
    }
  };

  return (
    <div className="card p-3 flex flex-col gap-2" role="status">
      <div className="flex items-center gap-3">
        <LoaderCircle className="animate-spin text-brand-primary shrink-0" size={18} />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-semibold text-text-primary">
            {TASK_PROGRESS_LABELS[task.type]}
          </span>
          <span className="text-sm text-text-secondary">
            {task.status === "queued"
              ? "Waiting to start"
              : (task.progressText ?? "Working")}
            {task.progressCurrent != null &&
              task.progressTotal != null &&
              ` ${task.progressCurrent}/${task.progressTotal}`}
          </span>
        </div>
        <button
          className="btn-secondary px-3 py-1 text-sm"
          disabled={isLoading}
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
      {fraction !== null && (
        <div className="h-1.5 rounded-full bg-surface-muted overflow-hidden">
          <div
            className="h-full bg-brand-primary transition-all"
            style={{ width: `${Math.round(fraction * 100)}%` }}
          />
        </div>
      )}
      <p className="text-xs text-text-secondary">
        You can keep using the app. We'll let you know when it's ready.
      </p>
    </div>
  );
}

function ReadyCard({
  task,
  onReview,
}: {
  task: AiTask;
  onReview: () => void;
}) {
  return (
    <div className="card p-3 flex items-center gap-3">
      <Sparkles className="text-brand-primary shrink-0" size={18} />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="font-semibold text-text-primary">
          {TASK_LABELS[task.type]} is ready
        </span>
        <span className="text-sm text-text-secondary">
          {task.opCount} {task.opCount === 1 ? "change" : "changes"} to review
        </span>
      </div>
      <button className="btn-primary px-3 py-1 text-sm" onClick={onReview}>
        Review
      </button>
    </div>
  );
}

function FailedCard({ task }: { task: AiTask }) {
  const [retryTask, { isLoading: isRetrying }] = useRetryAiTaskMutation();
  const [dismissTask, { isLoading: isDismissing }] = useRejectAiTaskMutation();

  const handleRetry = async () => {
    try {
      await retryTask({ tripId: task.tripId, taskId: task.id }).unwrap();
      toast.success(`${TASK_LABELS[task.type]} started again.`);
    } catch (err) {
      toast.error(errorMessage(err, "Could not retry the task."));
    }
  };

  const handleDismiss = async () => {
    try {
      await dismissTask({ tripId: task.tripId, taskId: task.id }).unwrap();
    } catch (err) {
      toast.error(errorMessage(err, "Could not dismiss the task."));
    }
  };

  return (
    <div className="card p-3 flex items-center gap-3" role="alert">
      <AlertTriangle className="text-error shrink-0" size={18} />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="font-semibold text-text-primary">
          {TASK_LABELS[task.type]} did not finish
        </span>
        <span className="text-sm text-text-secondary">
          {task.errorMessage ?? "Something went wrong."}
        </span>
      </div>
      <button
        className="btn-secondary px-3 py-1 text-sm"
        disabled={isDismissing || isRetrying}
        onClick={handleDismiss}
      >
        Dismiss
      </button>
      <button
        className="btn-primary px-3 py-1 text-sm"
        disabled={isDismissing || isRetrying}
        onClick={handleRetry}
      >
        Retry
      </button>
    </div>
  );
}
