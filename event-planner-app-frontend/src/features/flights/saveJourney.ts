import { toast } from "sonner";
import { isApiError } from "../api/utils";
import type { ApiResponse } from "../api/types";
import type { Flight } from "./types";

/** Runs a save, tells the user how it went, and returns what was saved. */
export async function saveJourneyWithToast(
  save: () => Promise<ApiResponse<Flight[]>>,
): Promise<Flight[]> {
  try {
    const { data: flights } = await save();
    toast.success(flights.length > 1 ? "Flights saved." : "Flight saved.");
    return flights;
  } catch (err) {
    toast.error(
      isApiError(err) ? err.data.message : "Could not save this flight.",
    );
    return [];
  }
}
