import { toast } from "sonner";
import { isApiError } from "../api/utils";
import type { ApiResponse } from "../api/types";
import type { Flight } from "./types";

/** Runs a save and tells the user how it went; `onSaved` gets the saved legs. */
export async function saveJourneyWithToast(
  save: () => Promise<ApiResponse<Flight[]>>,
  onSaved: (flights: Flight[]) => void,
): Promise<void> {
  try {
    const { data: flights } = await save();
    toast.success(flights.length > 1 ? "Flights saved." : "Flight saved.");
    onSaved(flights);
  } catch (err) {
    toast.error(
      isApiError(err) ? err.data.message : "Could not save this flight.",
    );
  }
}
