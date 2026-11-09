import { formatTimeInTripTimezone } from "../../utils/dateFormattors";
import type { Event } from "../events/types";
import type { ChangeEntity, ChangeOp } from "./types";

export interface ChangeOpSummary {
  title: string;
  detail: string;
  before?: string;
}

const ENTITY_LABELS: Record<ChangeEntity, string> = {
  event: "Event",
  accommodation: "Accommodation",
  packing_item: "Packing item",
  wishlist_item: "Wishlist item",
};

export const OP_LABELS: Record<ChangeOp["op"], string> = {
  create: "Add",
  update: "Change",
  delete: "Remove",
};

const text = (data: Record<string, unknown>, key: string) => {
  const value = data[key];
  return typeof value === "string" && value ? value : undefined;
};

// Events in the trip cache already hold trip-local "yyyy-MM-dd HH:mm" strings.
const localTimeRange = (event: Event) =>
  `${event.startAt.slice(11, 16)}–${event.endAt.slice(11, 16)}`;

const utcTimeRange = (
  data: Record<string, unknown>,
  timezone: string,
): string | undefined => {
  const startAt = text(data, "startAt");
  const endAt = text(data, "endAt");
  if (!startAt || !endAt) return undefined;
  return `${formatTimeInTripTimezone(startAt, timezone)}–${formatTimeInTripTimezone(endAt, timezone)}`;
};

export const describeChangeOp = (
  op: ChangeOp,
  events: Event[],
  timezone: string,
): ChangeOpSummary => {
  const existing =
    op.entity === "event" && op.id != null
      ? events.find((event) => event.id === op.id)
      : undefined;
  const title =
    text(op.data, "name") ??
    existing?.name ??
    `${ENTITY_LABELS[op.entity]}${op.id != null ? ` #${op.id}` : ""}`;

  if (op.op === "delete") {
    return {
      title,
      detail: existing ? localTimeRange(existing) : "Will be removed",
    };
  }

  switch (op.entity) {
    case "event": {
      const after = utcTimeRange(op.data, timezone);
      if (op.op === "update") {
        return {
          title,
          detail: after ?? "Details updated",
          before: existing ? localTimeRange(existing) : undefined,
        };
      }
      const address = text(op.data, "address");
      return {
        title,
        detail: [after, address].filter(Boolean).join(" · "),
      };
    }
    case "accommodation": {
      const start = text(op.data, "startDate");
      const end = text(op.data, "endDate");
      return { title, detail: start && end ? `${start} → ${end}` : "" };
    }
    case "packing_item":
      return { title, detail: text(op.data, "category") ?? "" };
    case "wishlist_item":
      return { title, detail: text(op.data, "wishlistName") ?? "AI ideas" };
  }
};

export const summariseApplied = (counts: {
  created: number;
  updated: number;
  deleted: number;
}) => {
  const parts = [
    counts.created && `${counts.created} added`,
    counts.updated && `${counts.updated} changed`,
    counts.deleted && `${counts.deleted} removed`,
  ].filter(Boolean);
  return parts.length ? `Changes applied: ${parts.join(", ")}.` : "No changes.";
};

export const CHANGE_ENTITY_ORDER: ChangeEntity[] = [
  "event",
  "packing_item",
  "accommodation",
  "wishlist_item",
];

export interface IndexedChangeOp {
  op: ChangeOp;
  /** Position in the proposal, which is what accepting refers to. */
  index: number;
}

export const groupOpsByEntity = (
  ops: ChangeOp[],
  kind?: ChangeOp["op"],
): { entity: ChangeEntity; items: IndexedChangeOp[] }[] => {
  const groups: { entity: ChangeEntity; items: IndexedChangeOp[] }[] = [];
  for (const entity of CHANGE_ENTITY_ORDER) {
    const items: IndexedChangeOp[] = [];
    for (let index = 0; index < ops.length; index++) {
      const op = ops[index];
      if (op.entity === entity && (!kind || op.op === kind)) {
        items.push({ op, index });
      }
    }
    if (items.length > 0) groups.push({ entity, items });
  }
  return groups;
};

export const countOpsByKind = (
  ops: ChangeOp[],
): Record<ChangeOp["op"], number> => ({
  create: ops.filter((op) => op.op === "create").length,
  update: ops.filter((op) => op.op === "update").length,
  delete: ops.filter((op) => op.op === "delete").length,
});
