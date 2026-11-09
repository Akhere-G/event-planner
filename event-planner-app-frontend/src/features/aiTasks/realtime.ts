import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { apiSlice } from "../api/apiSlice";
import type { AiTaskChangedWire } from "./types";
import { TASK_LABELS } from "./utils";

export const AI_TASK_EVENT = "ai_task:changed";

/**
 * Reacts to a task changing on the server: refreshes task lists, and tells the
 * user about outcomes that have no card or popup of their own. A task that is
 * ready opens its proposal popup, and a failed one stays on the trip as a card.
 */
export function handleAiTaskChanged(
  payload: AiTaskChangedWire,
  dispatch: Dispatch<UnknownAction>,
) {
  const tags: Array<"AiTasks" | "Notifications"> = ["AiTasks"];
  if (["ready", "empty", "failed"].includes(payload.status)) {
    tags.push("Notifications");
  }
  dispatch(apiSlice.util.invalidateTags(tags));

  if (payload.status === "empty") {
    toast.info(`${TASK_LABELS[payload.type]}: no changes suggested.`);
  } else if (payload.status === "failed") {
    toast.error(`${TASK_LABELS[payload.type]} did not finish. You can retry it.`);
  }
}
