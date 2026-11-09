import { Ban, Check, Info } from "lucide-react";
import type { Event } from "../../events/types";
import type { IndexedChangeOp } from "../utils";
import type { ChangeOp } from "../types";
import { describeChangeOp, OP_LABELS } from "../utils";

const BADGE_CLASSES: Record<ChangeOp["op"], string> = {
  create: "bg-success/15 text-success",
  update: "bg-info/15 text-info",
  delete: "bg-error/15 text-error",
};

export type ChangeStaleness = "changed" | "deleted";

const STALENESS_CHIP: Record<
  ChangeStaleness,
  { label: string; classes: string }
> = {
  changed: { label: "Changed since", classes: "bg-warning/15 text-warning" },
  deleted: { label: "No longer available", classes: "bg-error/10 text-error" },
};

const STALENESS_NOTE: Record<
  ChangeStaleness,
  { text: string; classes: string }
> = {
  changed: {
    text: "This item was edited after the AI started. Applying this suggestion may overwrite those edits.",
    classes: "border-warning bg-warning/10 text-text-primary",
  },
  deleted: {
    text: "This item was deleted while the AI was working, so this suggestion can't be applied.",
    classes: "border-error bg-error/10 text-error",
  },
};

interface ChangePreviewListProps {
  items: IndexedChangeOp[];
  events: Event[];
  timezone: string;
  selected: ReadonlySet<number>;
  staleness?: ReadonlyMap<number, ChangeStaleness>;
  onToggle: (index: number) => void;
}

export default function ChangePreviewList({
  items,
  events,
  timezone,
  selected,
  staleness = new Map(),
  onToggle,
}: ChangePreviewListProps) {
  return (
    <ul className="flex flex-col gap-2" aria-label="Proposed changes">
      {items.map(({ op, index }) => {
        const summary = describeChangeOp(op, events, timezone);
        const stale = staleness.get(index);
        const isUnavailable = stale === "deleted";
        const isSelected = selected.has(index);
        return (
          <li
            key={index}
            className={`relative overflow-hidden rounded-xl border ${
              isUnavailable
                ? "border-surface-border bg-surface-muted opacity-70"
                : isSelected
                  ? "border-brand-primary/40 bg-surface"
                  : "border-surface-border bg-surface"
            }`}
          >
            {isSelected && (
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-1 bg-brand-primary"
              />
            )}
            <label
              className={`relative flex items-start gap-3 p-3 pl-4 ${
                isUnavailable ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <input
                type="checkbox"
                className="peer sr-only"
                checked={isSelected}
                disabled={isUnavailable}
                onChange={() => onToggle(index)}
                aria-label={`${OP_LABELS[op.op]} ${summary.title}`}
              />
              <span
                aria-hidden
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-primary ${
                  isUnavailable
                    ? "border-dashed border-surface-border text-text-secondary"
                    : isSelected
                      ? "border-transparent bg-brand-primary text-text-inverse"
                      : "border-surface-border bg-surface"
                }`}
              >
                {isUnavailable ? (
                  <Ban size={14} />
                ) : (
                  isSelected && <Check size={14} />
                )}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_CLASSES[op.op]}`}
                  >
                    {OP_LABELS[op.op]}
                  </span>
                  <span className="font-semibold text-text-primary">
                    {summary.title}
                  </span>
                  {stale && (
                    <span
                      className={`ml-auto flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STALENESS_CHIP[stale].classes}`}
                    >
                      <Info size={12} /> {STALENESS_CHIP[stale].label}
                    </span>
                  )}
                </div>
                {(summary.before || summary.detail) && (
                  <p className="text-sm font-medium text-text-primary">
                    {summary.before && (
                      <>
                        <span className="text-text-secondary line-through">
                          {summary.before}
                        </span>
                        {" → "}
                      </>
                    )}
                    {summary.detail}
                  </p>
                )}
                {op.reason && (
                  <p className="text-sm text-text-secondary">{op.reason}</p>
                )}
                {stale && (
                  <p
                    className={`mt-1 border-l-2 px-3 py-1.5 text-xs font-semibold ${STALENESS_NOTE[stale].classes}`}
                  >
                    {STALENESS_NOTE[stale].text}
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
