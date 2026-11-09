import { countOpsByKind } from "../../ai/utils";
import type { ChangeEntity, ChangeOp } from "../../ai/types";

const LEGEND: { kind: ChangeOp["op"]; label: string; dot: string }[] = [
  { kind: "create", label: "add", dot: "bg-success" },
  { kind: "update", label: "change", dot: "bg-info" },
  { kind: "delete", label: "remove", dot: "bg-error" },
];

interface ProposalSummaryProps {
  tripName: string;
  ops: ChangeOp[];
  areas: ChangeEntity[];
}

/** The trip, how big the proposal is, and how it splits into adds, changes and removals. */
export default function ProposalSummary({
  tripName,
  ops,
  areas,
}: ProposalSummaryProps) {
  const counts = countOpsByKind(ops);
  return (
    <div className="flex flex-wrap items-end justify-between gap-2 border-b border-surface-border bg-surface px-5 py-4">
      <div>
        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-brand-primary">
          {tripName}
        </p>
        <p className="font-semibold text-text-primary">
          {ops.length} {ops.length === 1 ? "suggestion" : "suggestions"} across{" "}
          {areas.length} {areas.length === 1 ? "area" : "areas"}
        </p>
      </div>
      <ul className="flex gap-3 text-sm font-semibold text-text-secondary">
        {LEGEND.map(({ kind, label, dot }) => (
          <li key={kind} className="flex items-center gap-1.5">
            <span aria-hidden className={`h-2 w-2 rounded-full ${dot}`} />
            {counts[kind]} {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
