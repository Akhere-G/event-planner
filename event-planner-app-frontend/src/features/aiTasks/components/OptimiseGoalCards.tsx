import { Check, Clock, Map, Route, type LucideIcon } from "lucide-react";
import { OPTIMISE_GOALS } from "../schemas/optimiseDaySchema";
import type { OptimiseGoal } from "../types";

const GOAL_ICONS: Record<OptimiseGoal, LucideIcon> = {
  minimise_travel: Route,
  group_by_area: Map,
  respect_opening_hours: Clock,
};

interface OptimiseGoalCardsProps {
  selected: OptimiseGoal[];
  onChange: (goals: OptimiseGoal[]) => void;
}

export default function OptimiseGoalCards({
  selected,
  onChange,
}: OptimiseGoalCardsProps) {
  const toggle = (goal: OptimiseGoal) =>
    onChange(
      selected.includes(goal)
        ? selected.filter((item) => item !== goal)
        : [...selected, goal],
    );

  return (
    <fieldset className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <legend className="text-[0.65rem] font-bold uppercase tracking-widest text-brand-primary">
            2 · Set priorities
          </legend>
          <h3 className="text-lg font-semibold text-text-primary">
            What should the AI aim for?
          </h3>
        </div>
        <span className="text-sm text-text-secondary">Choose any</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {OPTIMISE_GOALS.map((goal) => {
          const Icon = GOAL_ICONS[goal.value];
          const isSelected = selected.includes(goal.value);
          return (
            <label
              key={goal.value}
              className={`relative flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-brand-primary ${
                isSelected
                  ? "border-brand-primary bg-brand-primary/10"
                  : "border-surface-border bg-surface hover:bg-surface-muted"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isSelected}
                onChange={() => toggle(goal.value)}
              />
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-brand-primary">
                <Icon size={18} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col pr-6">
                <span className="font-semibold text-text-primary">
                  {goal.label}
                </span>
                <span className="text-xs text-text-secondary">{goal.hint}</span>
              </span>
              <span
                aria-hidden
                className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-md border ${
                  isSelected
                    ? "border-transparent bg-brand-primary text-text-inverse"
                    : "border-surface-border bg-surface"
                }`}
              >
                {isSelected && <Check size={14} />}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
