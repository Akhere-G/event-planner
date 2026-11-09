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

/**
 * Proposals waiting for a decision. Signed-in users see them across every trip;
 * an anonymous visitor has no account to look them up by, so they see the
 * current trip's.
 */
export function usePendingProposals(anonymousTripId?: number) {
  const trip = useTripAiTasks(anonymousTripId ?? 0, anonymousTripId != null);
  const pending = useGetPendingAiTasksQuery(
    anonymousTripId != null ? skipToken : undefined,
  );

  if (anonymousTripId != null) {
    return trip.tasks.filter((task) => task.status === "ready");
  }
  return pending.data?.data ?? NO_TASKS;
}
