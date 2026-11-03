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

export interface ChangePreview {
  ops: ChangeOp[];
}

export interface ApplyChangeSetResult {
  created: number;
  updated: number;
  deleted: number;
}
