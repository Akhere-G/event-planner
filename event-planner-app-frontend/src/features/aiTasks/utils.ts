import type { AiTask, AiTaskStatus, AiTaskType } from "./types";

export const TASK_LABELS: Record<AiTaskType, string> = {
  fill_day: "Fill in day",
  optimise_day: "Optimise days",
  generate_trip: "Generate trip plan",
  generate_packing: "Smart packing list",
};

export const TASK_PROGRESS_LABELS: Record<AiTaskType, string> = {
  fill_day: "Filling in a day",
  optimise_day: "Optimising days",
  generate_trip: "Planning your trip",
  generate_packing: "Building your packing list",
};

const ACTIVE: AiTaskStatus[] = ["queued", "running"];

export const isActive = (task: AiTask) => ACTIVE.includes(task.status);

export const isActiveStatus = (status: AiTaskStatus) => ACTIVE.includes(status);

/** Days (yyyy-MM-dd) a day-level task works on. Empty for whole-trip tasks. */
export const taskDays = (task: AiTask): string[] => {
  if (task.type === "fill_day") return task.params.date ? [task.params.date] : [];
  if (task.type === "optimise_day") return task.params.dates ?? [];
  return [];
};

export const activeTaskForDay = (
  tasks: AiTask[],
  type: AiTaskType,
  date: string,
): AiTask | undefined =>
  tasks.find(
    (task) =>
      task.type === type && isActive(task) && taskDays(task).includes(date),
  );

export const progressFraction = (task: AiTask): number | null =>
  task.progressTotal && task.progressCurrent != null
    ? Math.min(1, task.progressCurrent / task.progressTotal)
    : null;

const plural = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;

export interface OptimiseRequestSummaryInput {
  dayCount: number;
  goalLabels: string[];
  pace: string;
  dayStart: string;
  dayEnd: string;
  lockedCount: number;
  allowAddRemove: boolean;
}

export const describeOptimiseRequest = ({
  dayCount,
  goalLabels,
  pace,
  dayStart,
  dayEnd,
  lockedCount,
  allowAddRemove,
}: OptimiseRequestSummaryInput): string => {
  const parts = [
    dayCount === 0 ? "No days chosen" : `Optimising ${plural(dayCount, "day")}`,
    goalLabels.length > 2
      ? plural(goalLabels.length, "goal")
      : goalLabels.join(" + ") || "No specific goal",
  ];
  if (pace) parts.push(`${pace} pace`);
  if (dayStart || dayEnd) parts.push(`${dayStart || "any"}–${dayEnd || "any"}`);
  if (lockedCount > 0) parts.push(`${plural(lockedCount, "event")} locked`);
  if (allowAddRemove) parts.push("may add or remove events");
  return parts.join(" · ");
};
