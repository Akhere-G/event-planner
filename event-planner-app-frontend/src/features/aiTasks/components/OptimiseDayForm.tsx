import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { eachDayOfInterval, format, parseISO } from "date-fns";
import { ChevronDown, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { FormInput, FormTextarea } from "../../../components";
import type { Event } from "../../events/types";
import {
  MAX_INSTRUCTIONS_LENGTH,
  OPTIMISE_GOALS,
  optimiseDaySchema,
  optimiseParamsFromForm,
  PACE_CHOICES,
  type OptimiseDaySchema,
} from "../schemas/optimiseDaySchema";
import type { AiTask, OptimiseDayParams } from "../types";
import { activeTaskForDay, describeOptimiseRequest } from "../utils";
import OptimiseDayPicker from "./OptimiseDayPicker";
import OptimiseGoalCards from "./OptimiseGoalCards";
import OptimiseLockedEvents from "./OptimiseLockedEvents";

const dayOf = (event: Event) => event.startAt.slice(0, 10);

interface OptimiseDayFormProps {
  tripStart: string;
  tripEnd: string;
  initialDate: string;
  events: Event[];
  tasks?: AiTask[];
  defaultPace?: string;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (params: OptimiseDayParams) => void;
}

export default function OptimiseDayForm({
  tripStart,
  tripEnd,
  initialDate,
  events,
  tasks = [],
  defaultPace = "",
  isSubmitting = false,
  onCancel,
  onSubmit,
}: OptimiseDayFormProps) {
  const { register, handleSubmit, watch, setValue, formState } =
    useForm<OptimiseDaySchema>({
      resolver: yupResolver(optimiseDaySchema),
      defaultValues: {
        dates: [initialDate],
        goals: ["minimise_travel"],
        pace: defaultPace,
        dayStart: "",
        dayEnd: "",
        lockedEventIds: [],
        allowAddRemove: false,
        instructions: "",
      },
    });
  const [showMore, setShowMore] = useState(false);

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: parseISO(tripStart),
        end: parseISO(tripEnd),
      }).map((day) => format(day, "yyyy-MM-dd")),
    [tripStart, tripEnd],
  );
  const busyDays = useMemo(() => {
    const busy = new Set<string>();
    for (const day of days) {
      if (activeTaskForDay(tasks, "optimise_day", day)) busy.add(day);
    }
    return busy;
  }, [days, tasks]);

  const [dates, goals, lockedEventIds, instructions] = watch([
    "dates",
    "goals",
    "lockedEventIds",
    "instructions",
  ]);
  const [pace, dayStart, dayEnd, allowAddRemove] = watch([
    "pace",
    "dayStart",
    "dayEnd",
    "allowAddRemove",
  ]);

  const eventsOnChosenDays = events.filter((event) =>
    dates.includes(dayOf(event)),
  );
  const chosenEventIds = new Set(eventsOnChosenDays.map((event) => event.id));
  const lockedOnChosenDays = lockedEventIds.filter((id) =>
    chosenEventIds.has(id),
  );

  const optionsChangedFromDefault = [
    pace !== "",
    dayStart !== "" || dayEnd !== "",
    lockedOnChosenDays.length > 0,
    allowAddRemove,
    instructions.trim() !== "",
  ].filter(Boolean).length;

  const goalLabels: string[] = [];
  for (const goal of OPTIMISE_GOALS) {
    if (goals.includes(goal.value)) goalLabels.push(goal.label);
  }

  const summary = describeOptimiseRequest({
    dayCount: dates.length,
    goalLabels,
    pace,
    dayStart,
    dayEnd,
    lockedCount: lockedOnChosenDays.length,
    allowAddRemove,
  });

  const toggleLocked = (eventId: number) =>
    setValue(
      "lockedEventIds",
      lockedEventIds.includes(eventId)
        ? lockedEventIds.filter((id) => id !== eventId)
        : [...lockedEventIds, eventId],
    );

  return (
    <form
      className="form flex min-h-0 flex-1 flex-col"
      onSubmit={handleSubmit((values) =>
        onSubmit(optimiseParamsFromForm(values, chosenEventIds)),
      )}
    >
      <div className="relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-5">
        <div className="flex flex-col gap-1">
          <OptimiseDayPicker
            days={days}
            selected={dates}
            busyDays={busyDays}
            onChange={(next) =>
              setValue("dates", next, { shouldValidate: true })
            }
          />
          {formState.errors.dates && (
            <p className="text-xs text-error">
              {formState.errors.dates.message}
            </p>
          )}
        </div>

        <OptimiseGoalCards
          selected={goals}
          onChange={(next) => setValue("goals", next, { shouldValidate: true })}
        />

        <section className="rounded-xl border border-surface-border">
          <button
            type="button"
            aria-expanded={showMore}
            onClick={() => setShowMore((open) => !open)}
            className="flex w-full items-center justify-between gap-3 p-3 text-left"
          >
            <span className="flex flex-col">
              <span className="font-semibold text-text-primary">
                More options
              </span>
              <span className="text-sm font-normal text-text-secondary">
                Fine-tune pace, timing and what can change
              </span>
            </span>
            <span className="flex items-center gap-2">
              {optionsChangedFromDefault > 0 && (
                <span className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-semibold text-brand-primary">
                  {optionsChangedFromDefault} set
                </span>
              )}
              <ChevronDown
                size={18}
                className={`text-text-secondary transition-transform ${showMore ? "rotate-180" : ""}`}
              />
            </span>
          </button>

          {/* Kept mounted so the form keeps its values while collapsed. */}
          <div
            hidden={!showMore}
            className="flex flex-col gap-5 border-t border-surface-border p-4"
          >
            <fieldset className="flex flex-col gap-2">
              <legend className="font-semibold text-text-primary">
                Pace{" "}
                <span className="text-xs font-normal text-text-secondary">
                  Optional
                </span>
              </legend>
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-muted p-1 sm:grid-cols-4">
                {PACE_CHOICES.map((choice) => (
                  <button
                    key={choice.value || "none"}
                    type="button"
                    aria-pressed={pace === choice.value}
                    onClick={() => setValue("pace", choice.value)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                      pace === choice.value
                        ? "bg-surface text-text-primary shadow-sm"
                        : "text-text-secondary"
                    }`}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className="font-semibold text-text-primary">
                Time window{" "}
                <span className="text-xs font-normal text-text-secondary">
                  Trip's local time · optional
                </span>
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Day starts"
                  type="time"
                  {...register("dayStart")}
                  errorMessage={formState.errors.dayStart?.message}
                />
                <FormInput
                  label="Day ends"
                  type="time"
                  {...register("dayEnd")}
                  errorMessage={formState.errors.dayEnd?.message}
                />
              </div>
            </fieldset>

            <OptimiseLockedEvents
              events={eventsOnChosenDays}
              days={days}
              locked={lockedOnChosenDays}
              onToggle={toggleLocked}
            />

            <div className="flex flex-col gap-2">
              <label className="relative flex cursor-pointer items-center justify-between gap-3">
                <span className="flex flex-col">
                  <span className="font-semibold text-text-primary">
                    Allow event changes
                  </span>
                  <span className="text-sm text-text-secondary">
                    Let the AI add or remove events
                  </span>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  aria-label="Allow event changes"
                  className="peer sr-only"
                  {...register("allowAddRemove")}
                />
                <span
                  aria-hidden
                  className="relative h-6 w-11 shrink-0 rounded-full bg-surface-border transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-surface after:shadow after:transition-transform peer-checked:bg-brand-primary peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-primary"
                />
              </label>
              {allowAddRemove && (
                <p className="flex gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm text-text-primary">
                  <TriangleAlert size={16} className="mt-0.5 shrink-0 text-warning" />
                  The AI may suggest new venues or remove existing ones.
                  You'll review every change before it's applied.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <FormTextarea
                label="Anything else the AI should know? (optional)"
                placeholder="e.g. We'd like a long lunch, and no museums on the last day."
                {...register("instructions")}
                value={instructions}
                errorMessage={formState.errors.instructions?.message}
              />
              <span className="self-end text-xs text-text-secondary">
                {instructions.length} / {MAX_INSTRUCTIONS_LENGTH}
              </span>
            </div>
          </div>
        </section>
      </div>

      <footer className="flex flex-col gap-3 border-t border-surface-border bg-surface p-4">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-text-secondary">
            Your request
          </p>
          <p className="text-sm font-medium text-text-primary">{summary}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-secondary">
            Runs in the background. Keep using the app—nothing changes until you
            accept.
          </p>
          <div className="flex gap-2 sm:shrink-0">
            <button
              type="button"
              className="btn-secondary flex-1 sm:flex-none"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex flex-1 items-center justify-center gap-2 sm:flex-none"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              Optimise
            </button>
          </div>
        </div>
      </footer>
    </form>
  );
}
