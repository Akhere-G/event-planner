import { useEffect } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetPendingAiTasksQuery,
  useGetTripAiTasksQuery,
} from "./services/aiTaskApiSlice";
import type { AiTask } from "./types";
import { isActive } from "./utils";

const POLL_MS = 4000;
const NO_TASKS: AiTask[] = [];

/**
 * The caller's live tasks on a trip. Socket events normally refresh them; polling
 * while something is running covers a dropped socket and anonymous visitors.
 */
export function useTripAiTasks(tripId: number, enabled = true) {
  const query = useGetTripAiTasksQuery(enabled ? tripId : skipToken);
  const tasks = query.data?.data ?? NO_TASKS;
  const hasActive = tasks.some(isActive);
  const { refetch } = query;

  useEffect(() => {
    if (!hasActive) return;
    const timer = setInterval(() => void refetch(), POLL_MS);
    return () => clearInterval(timer);
  }, [hasActive, refetch]);

  return { tasks, isLoading: query.isLoading, isError: query.isError };
}

export function usePendingProposals(tripId: number) {
  const pending = useGetPendingAiTasksQuery(tripId);
  return pending.data?.data ?? NO_TASKS;
}
