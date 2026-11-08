import type { Expense } from "../expenses/types";

export interface Accommodation {
  id: number;
  itineraryId: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  startDate: string;
  endDate: string;
  expense?: Expense | null;
}

export interface CreateAccommodationPayload {
  tripId: number;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  startDate: string;
  endDate: string;
}

export interface UpdateAccommodationPayload {
  tripId: number;
  accommodationId: number;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface DeleteAccommodationPayload {
  tripId: number;
  accommodationId: number;
}
