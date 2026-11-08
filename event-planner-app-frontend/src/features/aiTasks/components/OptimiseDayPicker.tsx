import { format, parseISO } from "date-fns";

interface OptimiseDayPickerProps {
  days: string[];
  selected: string[];
  /** Days that already have an optimise task running. */
  busyDays: ReadonlySet<string>;
  onChange: (days: string[]) => void;
}

/** A grid of days to tick, with shortcuts to select or clear them all. */
export default function OptimiseDayPicker({
  days,
  selected,
  busyDays,
  onChange,
}: OptimiseDayPickerProps) {
  const available = days.filter((day) => !busyDays.has(day));

  const toggle = (day: string) =>
    onChange(
      selected.includes(day)
        ? selected.filter((item) => item !== day)
        : [...selected, day],
    );

  return (
    <fieldset className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <legend className="text-[0.65rem] font-bold uppercase tracking-widest text-brand-primary">
            1 · Choose days
          </legend>
          <h3 className="text-lg font-semibold text-text-primary">
            Which days should we improve?
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-brand-primary">
          <button type="button" onClick={() => onChange(available)}>
            Select all
          </button>
          <span className="h-4 w-px bg-surface-border" aria-hidden />
          <button type="button" onClick={() => onChange([])}>
            Clear
          </button>
        </div>
      </div>

      <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto p-0.5 sm:grid-cols-4">
        {days.map((day, index) => {
          const isSelected = selected.includes(day);
          const isBusy = busyDays.has(day);
          return (
            <button
              key={day}
              type="button"
              aria-pressed={isSelected}
              aria-label={`Day ${index + 1}, ${format(parseISO(day), "EEEE d MMMM")}`}
              disabled={isBusy}
              onClick={() => toggle(day)}
              className={`flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left transition-colors ${
                isBusy
                  ? "cursor-not-allowed border-surface-border bg-surface-muted opacity-60"
                  : isSelected
                    ? "border-brand-primary bg-brand-primary/10 ring-1 ring-brand-primary"
                    : "border-surface-border bg-surface hover:bg-surface-muted"
              }`}
            >
              <span className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-text-secondary">
                  D{index + 1}
                </span>
                <span className="font-semibold text-text-primary">
                  {format(parseISO(day), "EEE d")}
                </span>
              </span>
              {isBusy && (
                <span className="text-xs text-text-secondary">Optimising…</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-text-secondary">
        {selected.length} of {days.length} selected
      </p>
    </fieldset>
  );
}
