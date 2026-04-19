import type { Trip } from "../trips/types";

export interface Invite {
  id: number;
  itineraryId: number;
  email: string;
  inviterId: number;
  role: string;
  status: string;
  token?: string;
  expiresAt: string;
  itinerary?: Trip;
}
