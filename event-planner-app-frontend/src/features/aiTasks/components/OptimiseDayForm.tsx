import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { eachDayOfInterval, format, parseISO } from "date-fns";
import { FormInput, FormTextarea } from "../../../components";
import { formatDateRelative } from "../../../utils/dateFormattors";
import type { Event } from "../../events/types";
import {
  MAX_INSTRUCTIONS_LENGTH,
  OPTIMISE_GOALS,
  optimiseDaySchema,
  optimiseParamsFromForm,
  PACE_CHOICES,
  type OptimiseDaySchema,
} from "../schemas/optimiseDaySchema";
import type { OptimiseDayParams } from "../types";

export const OPTIMISE_FORM_ID = "optimise-day-form";

const dayOf = (event: Event) => event.startAt.slice(0, 10);

interface OptimiseDayFormProps {
  tripStart: string;
  tripEnd: string;
  /** The day the form was opened from, ticked to begin with. */
  initialDate: string;
  events: Event[];
  defaultPace?: string;
  onSubmit: (params: OptimiseDayParams) => void;
}

/** Collects what the AI should aim for. Submit it with a button for `OPTIMISE_FORM_ID`. */
export default function OptimiseDayForm({
  tripStart,
  tripEnd,
  initialDate,
  events,
  defaultPace = "",
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

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: parseISO(tripStart),
        end: parseISO(tripEnd),
      }).map((day) => format(day, "yyyy-MM-dd")),
    [tripStart, tripEnd],
  );

  const [dates, goals, lockedEventIds, instructions] = watch([
    "dates",
    "goals",
    "lockedEventIds",
    "instructions",
  ]);
  const pace = watch("pace");

  const eventsOnChosenDays = events
    .filter((event) => dates.includes(dayOf(event)))
    .sort((a, b) => a.startAt.localeCompare(b.startAt));

  const toggle = <T,>(current: T[], value: T) =>
    current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

  return (
    <form
      id={OPTIMISE_FORM_ID}
      className="form flex flex-col gap-5"
      onSubmit={handleSubmit((values) =>
        onSubmit(
          optimiseParamsFromForm(
            values,
            new Set(eventsOnChosenDays.map((event) => event.id)),
          ),
        ),
      )}
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-text-primary">
          Days to optimise
        </legend>
        <div className="flex flex-wrap gap-2">
          {days.map((day, index) => {
            const selected = dates.includes(day);
            return (
              <button
                key={day}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  setValue("dates", toggle(dates, day), {
                    shouldValidate: true,
                  })
                }
                className={`px-3 py-1.5 rounded-xl border text-sm cursor-pointer ${
                  selected
                    ? "bg-brand-primary text-text-inverse border-transparent"
                    : "bg-surface text-text-primary border-surface-border hover:bg-surface-muted"
                }`}
              >
                Day {index + 1} · {formatDateRelative(day)}
              </button>
            );
          })}
        </div>
        {formState.errors.dates && (
          <p className="text-xs text-error">{formState.errors.dates.message}</p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-text-primary">
          Goals
        </legend>
        {OPTIMISE_GOALS.map((goal) => (
          <label key={goal.value} className="flex gap-3 items-start cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 accent-brand-primary w-auto"
              checked={goals.includes(goal.value)}
              onChange={() =>
                setValue("goals", toggle(goals, goal.value), {
                  shouldValidate: true,
                })
              }
            />
            <span className="flex flex-col">
              <span className="text-sm text-text-primary">{goal.label}</span>
              <span className="text-xs text-text-secondary">{goal.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-text-primary">Pace</legend>
        <div className="flex flex-wrap gap-2">
          {PACE_CHOICES.map((choice) => (
            <button
              key={choice.value || "keep"}
              type="button"
              aria-pressed={pace === choice.value}
              onClick={() => setValue("pace", choice.value)}
              className={`px-3 py-1.5 rounded-xl border text-sm cursor-pointer ${
                pace === choice.value
                  ? "bg-brand-primary text-text-inverse border-transparent"
                  : "bg-surface text-text-primary border-surface-border hover:bg-surface-muted"
              }`}
            >
              {choice.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-text-primary">
          Time window{" "}
          <span className="text-xs font-normal text-text-secondary">
            (optional, in the trip's local time)
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

      {eventsOnChosenDays.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-text-primary">
            Keep these exactly as they are
          </legend>
          {eventsOnChosenDays.map((event) => (
            <label key={event.id} className="flex gap-3 items-center cursor-pointer">
              <input
                type="checkbox"
                className="accent-brand-primary w-auto"
                checked={lockedEventIds.includes(event.id)}
                onChange={() =>
                  setValue("lockedEventIds", toggle(lockedEventIds, event.id))
                }
              />
              <span className="text-sm text-text-primary">
                {event.name}{" "}
                <span className="text-text-secondary">
                  {event.startAt.slice(11, 16)}–{event.endAt.slice(11, 16)}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      )}

      <label className="flex gap-3 items-start cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 accent-brand-primary w-auto"
          {...register("allowAddRemove")}
        />
        <span className="flex flex-col">
          <span className="text-sm text-text-primary">
            Allow the AI to add or remove events
          </span>
          <span className="text-xs text-text-secondary">
            Off by default: events are only reordered and retimed.
          </span>
        </span>
      </label>

      <div className="relative">
        <FormTextarea
          label="Anything else the AI should know? (optional)"
          placeholder="e.g. We'd like a long lunch, and no museums on the last day."
          {...register("instructions")}
          value={instructions}
          errorMessage={formState.errors.instructions?.message}
        />
        <span className="absolute right-1 -bottom-5 text-xs text-text-secondary">
          {instructions.length}/{MAX_INSTRUCTIONS_LENGTH}
        </span>
      </div>
    </form>
  );
}
