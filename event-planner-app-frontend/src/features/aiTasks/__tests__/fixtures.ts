import type { Event } from "../../events/types";
import type { AiTask, AiTaskDetail } from "../types";

export const TRIP = {
  id: 5,
  name: "Paris",
  destination: "Paris",
  timezone: "Europe/Paris",
  role: "admin",
  startDate: "2026-08-01",
  endDate: "2026-08-03",
  events: [],
  userMemberships: [],
  invites: [],
  latitude: 0,
  longitude: 0,
  createdAt: "2026-01-01T00:00:00",
  anonymousAccessCode: null,
};

export const EVENT: Event = {
  id: 11,
  name: "Louvre",
  address: "Rue de Rivoli",
  latitude: 0,
  longitude: 0,
  startAt: "2026-08-02T10:00:00Z",
  endAt: "2026-08-02T12:00:00Z",
  category: "Museum",
};

export function aiTask(overrides: Partial<AiTask> = {}): AiTask {
  return {
    id: 1,
    tripId: 5,
    tripName: "Paris",
    type: "optimise_day",
    status: "running",
    params: { dates: ["2026-08-02"] },
    progressText: null,
    progressCurrent: null,
    progressTotal: null,
    errorMessage: null,
    appliedCounts: null,
    opCount: 0,
    createdAt: "2026-08-01T09:00:00",
    finishedAt: null,
    expiresAt: null,
    ...overrides,
  };
}

export function aiTaskDetail(
  overrides: Partial<AiTaskDetail> = {},
): AiTaskDetail {
  return {
    ...aiTask({ status: "ready", opCount: 2 }),
    ops: [
      {
        op: "create",
        entity: "event",
        data: {
          name: "Dinner",
          address: "1 Rue Cler",
          startAt: "2026-08-02T17:00:00Z",
          endAt: "2026-08-02T19:00:00Z",
        },
        reason: "Close to your hotel.",
      },
      { op: "delete", entity: "event", id: 11, data: {} },
    ],
    changedOpIndexes: [],
    unavailableOpIndexes: [],
    ...overrides,
  };
}

export const ok = <T>(data: T) => ({ success: true, data });
