import type { ChatMessage } from "../../components";
import type { AiTask } from "../aiTasks/types";

export interface TripInsight {
  title: string;
  content: string;
}

export type ChangeOpKind = "create" | "update" | "delete";

export type ChangeEntity =
  "event" | "accommodation" | "packing_item" | "wishlist_item";

export interface ChangeOp {
  op: ChangeOpKind;
  entity: ChangeEntity;
  id?: number | null;
  data: Record<string, unknown>;
  reason?: string | null;
}

export interface ApplyChangeSetResult {
  created: number;
  updated: number;
  deleted: number;
}

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface EditTripResult {
  reply: string;
  task: AiTask | null;
}

export interface EditMessage extends ChatMessage {
  /** The proposal this reply produced, when it suggests changes. */
  taskId?: number;
  opCount?: number;
}
