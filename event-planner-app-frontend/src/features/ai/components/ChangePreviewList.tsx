import type { Event } from "../../events/types";
import type { ChangeOp } from "../types";
import { describeChangeOp, OP_LABELS } from "../utils";

const BADGE_CLASSES: Record<ChangeOp["op"], string> = {
  create: "bg-success/15 text-success",
  update: "bg-info/15 text-info",
  delete: "bg-error/15 text-error",
};

interface ChangePreviewListProps {
  ops: ChangeOp[];
  events: Event[];
  timezone: string;
  selected: ReadonlySet<number>;
  /** Changes whose target was edited since the AI looked at it: they cannot be applied. */
  outdated?: ReadonlySet<number>;
  onToggle: (index: number) => void;
}

/** The proposed changes with a checkbox each. Holds no state of its own. */
export default function ChangePreviewList({
  ops,
  events,
  timezone,
  selected,
  outdated = new Set(),
  onToggle,
}: ChangePreviewListProps) {
  return (
    <ul className="flex flex-col gap-2 p-4" aria-label="Proposed changes">
      {ops.map((op, index) => {
        const summary = describeChangeOp(op, events, timezone);
        const isOutdated = outdated.has(index);
        return (
          <li
            key={index}
            className={`card p-3 ${isOutdated ? "opacity-60" : ""}`}
          >
            <label
              className={`flex gap-3 items-start ${isOutdated ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <input
                type="checkbox"
                className="mt-1 accent-brand-primary w-auto"
                checked={selected.has(index)}
                disabled={isOutdated}
                onChange={() => onToggle(index)}
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
                  {isOutdated && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-warning/15 text-warning">
                      Changed since
                    </span>
                  )}
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
  );
}
