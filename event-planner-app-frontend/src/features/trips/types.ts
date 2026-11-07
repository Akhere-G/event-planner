import type { User } from "../users/types";
import type { Invite } from "../invites/types";
import type { Event } from "../events/types";

export interface Trip {
  id: number;
  name: string;
  destination: string;
  latitude: number;
  longitude: number;
  role: string;
  description?: string;
  timezone: string;
  budgetAmountGbp?: number | null;
  startDate: string;
  endDate: string;
  userMemberships: User[];
  /** Snapshot from the trip fetch; use `useTripEvents` for live events. */
  events: Event[];
  invites: Invite[];
  adminCode?: string;
  editorCode?: string;
  viewerCode?: string;
  createdAt: string;
  anonymousAccessCode: string | null;
}

export interface AnonTrip {
  anonymousAccessCode: string;
  tripId: number;
}

export interface TripPreferences {
  tripType: "solo" | "couple" | "friends" | "family" | null;
  groupSize: number | null;
  vibes: string[];
  budgetTier: "budget" | "mid" | "luxury" | null;
  pace: "relaxed" | "balanced" | "packed" | null;
  interests: string[];
  transport: "walking" | "public_transport" | "driving" | "cycling" | null;
}
