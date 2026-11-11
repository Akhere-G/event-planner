import { formatTimeInTripTimezone } from "../../utils/dateFormattors";
import type { Event } from "../events/types";
import { formatCurrency } from "../expenses/utils";
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
  wishlist: "Wishlist",
  wishlist_item: "Wishlist item",
  trip: "Trip",
  expense: "Expense",
  settlement: "Payment",
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

const amount = (data: Record<string, unknown>, key: string) => {
  const value = data[key];
  return typeof value === "number" ? value : undefined;
};

const joinDetails = (parts: (string | undefined)[]) =>
  parts.filter(Boolean).join(" · ");

const dateRange = (data: Record<string, unknown>) => {
  const start = text(data, "startDate");
  const end = text(data, "endDate");
  if (start && end) return `${start} → ${end}`;
  if (start) return `Starts ${start}`;
  if (end) return `Ends ${end}`;
  return undefined;
};

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
    text(op.data, "description") ??
    op.label ??
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
    case "wishlist":
      return {
        title,
        detail:
          op.op === "update" && op.label
            ? `Renamed from ${op.label}`
            : "New wishlist",
      };
    case "trip": {
      const budget = amount(op.data, "budgetAmountGbp");
      return {
        title,
        detail: joinDetails([
          dateRange(op.data),
          budget === undefined ? undefined : `Budget ${formatCurrency(budget)}`,
        ]),
      };
    }
    case "expense": {
      const total = amount(op.data, "amount");
      return {
        title,
        detail: joinDetails([
          total === undefined
            ? undefined
            : formatCurrency(total, text(op.data, "currency")),
          text(op.data, "spentOn"),
          text(op.data, "category"),
        ]),
      };
    }
    case "settlement": {
      const paid = amount(op.data, "amountGbp");
      return {
        title,
        detail: joinDetails([
          paid === undefined ? undefined : formatCurrency(paid),
          text(op.data, "settledOn"),
        ]),
      };
    }
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
  "wishlist",
  "wishlist_item",
  "trip",
  "expense",
  "settlement",
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
