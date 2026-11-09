import type { AutofillConfig } from "../events/types";
import type { ApplyChangeSetResult, ChangeOp } from "../ai/types";

export type AiTaskType =
  "fill_day" | "optimise_day" | "generate_trip" | "generate_packing";

export type AiTaskStatus =
  | "queued"
  | "running"
  | "ready"
  | "accepted"
  | "rejected"
  | "failed"
  | "cancelled"
  | "expired"
  | "empty";

export interface AiTask {
  id: number;
  tripId: number;
  tripName: string;
  type: AiTaskType;
  status: AiTaskStatus;
  /** Echo of what was asked for. Keys are camelCased by the API. */
  params: {
    date?: string;
    dates?: string[];
  };
  progressText: string | null;
  progressCurrent: number | null;
  progressTotal: number | null;
  errorMessage: string | null;
  appliedCounts: ApplyChangeSetResult | null;
  opCount: number;
  createdAt: string;
  finishedAt: string | null;
  expiresAt: string | null;
}

export interface AiTaskDetail extends AiTask {
  ops: ChangeOp[];
  /** Ops whose target was edited after the task started: still applicable, but may overwrite. */
  changedOpIndexes: number[];
  /** Ops whose target was deleted after the task started: can no longer be applied. */
  unavailableOpIndexes: number[];
}

export interface AcceptAiTaskResult {
  applied: ApplyChangeSetResult;
  skippedUnavailable: number;
}

export type FillDayParams = AutofillConfig & { date: string };

export type OptimiseGoal =
  "minimise_travel" | "group_by_area" | "respect_opening_hours";

export interface OptimiseDayParams {
  dates: string[];
  goals: OptimiseGoal[];
  pace: string | null;
  dayStart: string | null;
  dayEnd: string | null;
  lockedEventIds: number[];
  allowAddRemove: boolean;
  instructions: string;
}

export interface AiTaskParams {
  fill_day: FillDayParams;
  optimise_day: OptimiseDayParams;
  generate_trip: Record<string, never>;
  generate_packing: Record<string, never>;
}

/** What the server tells the browser over `ai_task:changed`. */
export interface AiTaskChangedWire {
  task_id: number;
  trip_id: number;
  type: AiTaskType;
  status: AiTaskStatus;
  progress_text: string | null;
  progress_current: number | null;
  progress_total: number | null;
}
