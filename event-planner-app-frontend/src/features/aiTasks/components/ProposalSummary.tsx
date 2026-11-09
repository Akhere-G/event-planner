import type { ChangeEntity, ChangeOp } from "../../ai/types";

interface ProposalSummaryProps {
  tripName: string;
  ops: ChangeOp[];
  areas: ChangeEntity[];
}

export default function ProposalSummary({
  tripName,
  ops,
  areas,
}: ProposalSummaryProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2 border-b border-surface-border bg-surface px-5 py-4 ">
      <div>
        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-brand-primary">
          {tripName}
        </p>
        <p className="font-semibold text-text-primary">
          {ops.length} {ops.length === 1 ? "suggestion" : "suggestions"} across{" "}
          {areas.length} {areas.length === 1 ? "area" : "areas"}
        </p>
      </div>
    </div>
  );
}
