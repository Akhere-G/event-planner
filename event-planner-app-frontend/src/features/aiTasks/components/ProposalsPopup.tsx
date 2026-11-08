import { formatDistanceToNow, parseISO } from "date-fns";
import { ConfirmModal } from "../../../components";
import type { AiTask } from "../types";
import { TASK_LABELS } from "../utils";

interface ProposalsPopupProps {
  proposals: AiTask[];
  onReview: (task: AiTask) => void;
  onDecideLater: () => void;
}

/** Lists the AI proposals waiting for a decision, so none is missed on returning to the app. */
export default function ProposalsPopup({
  proposals,
  onReview,
  onDecideLater,
}: ProposalsPopupProps) {
  return (
    <ConfirmModal
      open
      onOpenChange={(open) => !open && onDecideLater()}
      title={
        proposals.length === 1
          ? "An AI suggestion is ready"
          : `${proposals.length} AI suggestions are ready`
      }
      description="Review them now, or decide later. They stay available for 7 days."
      hideButtons
    >
      <ul className="flex flex-col gap-2 p-4" aria-label="Pending AI suggestions">
        {proposals.map((task) => (
          <li
            key={task.id}
            className="card p-3 flex items-center justify-between gap-3"
          >
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-text-primary">
                {TASK_LABELS[task.type]}
              </span>
              <span className="text-sm text-text-secondary truncate">
                {task.tripName} · {task.opCount}{" "}
                {task.opCount === 1 ? "change" : "changes"}
                {task.expiresAt &&
                  ` · expires in ${formatDistanceToNow(parseISO(task.expiresAt))}`}
              </span>
            </div>
            <button
              className="btn-primary px-4 shrink-0"
              onClick={() => onReview(task)}
            >
              Review
            </button>
          </li>
        ))}
      </ul>
      <div className="flex justify-end border-t border-surface-border p-4">
        <button className="btn-secondary" onClick={onDecideLater}>
          Decide later
        </button>
      </div>
    </ConfirmModal>
  );
}
