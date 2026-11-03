import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";
import { ConfirmModal } from "../../../components";
import type { Event } from "../../events/types";
import { isApiError } from "../../api/utils";
import { useApplyChangeSetMutation } from "../services/aiApiSlice";
import type { ChangeOp } from "../types";
import { describeChangeOp, OP_LABELS, summariseApplied } from "../utils";

const BADGE_CLASSES: Record<ChangeOp["op"], string> = {
  create: "bg-success/15 text-success",
  update: "bg-info/15 text-info",
  delete: "bg-error/15 text-error",
};

interface ChangePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: number;
  timezone: string;
  ops: ChangeOp[];
  events: Event[];
  title: string;
  description?: string;
  onApplied?: () => void;
}

export default function ChangePreviewModal({
  open,
  onOpenChange,
  tripId,
  timezone,
  ops,
  events,
  title,
  description = "Review the proposed changes. Nothing is saved until you apply them.",
  onApplied,
}: ChangePreviewModalProps) {
  const posthog = usePostHog();
  const [applyChangeSet, { isLoading }] = useApplyChangeSetMutation();
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(ops.map((_, index) => index)),
  );

  const toggle = (index: number) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const handleApply = async () => {
    const chosen = ops.filter((_, index) => selected.has(index));
    try {
      const result = await applyChangeSet({ tripId, ops: chosen }).unwrap();
      toast.success(summariseApplied(result.data));
      onApplied?.();
      onOpenChange(false);
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.data.message);
      } else {
        posthog?.captureException(err);
        toast.error("Could not apply the changes.");
      }
    }
  };

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmText={
        selected.size === 0
          ? "Select changes"
          : `Apply ${selected.size} ${selected.size === 1 ? "change" : "changes"}`
      }
      confirmAction={handleApply}
      confirmBtnClasses="btn-primary h-11 px-4"
      confirmButtonProps={{ disabled: isLoading || selected.size === 0 }}
    >
      <ul className="flex flex-col gap-2 p-4" aria-label="Proposed changes">
        {ops.map((op, index) => {
          const summary = describeChangeOp(op, events, timezone);
          return (
            <li key={index} className="card p-3">
              <label className="flex gap-3 items-start cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 accent-brand-primary"
                  checked={selected.has(index)}
                  onChange={() => toggle(index)}
                  aria-label={`${OP_LABELS[op.op]} ${summary.title}`}
                />
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex gap-2 items-center flex-wrap">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE_CLASSES[op.op]}`}
                    >
                      {OP_LABELS[op.op]}
                    </span>
                    <span className="font-semibold text-text-primary">
                      {summary.title}
                    </span>
                  </div>
                  {(summary.before || summary.detail) && (
                    <p className="text-sm text-text-secondary">
                      {summary.before && (
                        <>
                          <span className="line-through">{summary.before}</span>
                          {" → "}
                        </>
                      )}
                      {summary.detail}
                    </p>
                  )}
                  {op.reason && (
                    <p className="text-sm italic text-text-secondary">
                      {op.reason}
                    </p>
                  )}
                </div>
              </label>
            </li>
          );
        })}
      </ul>
      {isLoading && (
        <div className="flex justify-center p-2">
          <LoaderCircle className="animate-spin" size={18} />
        </div>
      )}
    </ConfirmModal>
  );
}
