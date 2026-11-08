import type { AiTask, AiTaskStatus, AiTaskType } from "./types";

export const TASK_LABELS: Record<AiTaskType, string> = {
  fill_day: "Fill in day",
  optimise_day: "Optimise days",
  generate_trip: "Generate trip plan",
  generate_packing: "Smart packing list",
};

/** Present-tense wording for a task that is still working. */
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

/** The active task of this type that already covers the given day, if any. */
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
