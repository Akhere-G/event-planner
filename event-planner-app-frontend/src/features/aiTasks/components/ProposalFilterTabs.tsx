import { countOpsByKind } from "../../ai/utils";
import type { ChangeOp } from "../../ai/types";

export type ProposalFilter = "all" | ChangeOp["op"];

const TABS: { value: ProposalFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "create", label: "Add" },
  { value: "update", label: "Change" },
  { value: "delete", label: "Remove" },
];

interface ProposalFilterTabsProps {
  ops: ChangeOp[];
  value: ProposalFilter;
  onChange: (filter: ProposalFilter) => void;
}

export default function ProposalFilterTabs({
  ops,
  value,
  onChange,
}: ProposalFilterTabsProps) {
  const counts = countOpsByKind(ops);
  return (
    <div
      role="group"
      aria-label="Filter suggestions"
      className="flex gap-1 overflow-x-auto border-b border-surface-border bg-surface-muted px-5 py-3"
    >
      {TABS.map((tab) => {
        const count = tab.value === "all" ? ops.length : counts[tab.value];
        const isActive = value === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(tab.value)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
              isActive
                ? "bg-surface text-brand-primary shadow-sm"
                : "text-text-secondary hover:bg-surface/60"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                isActive
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "bg-surface-border text-text-secondary"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
