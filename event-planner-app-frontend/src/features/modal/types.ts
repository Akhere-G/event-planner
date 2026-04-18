import type { Trip } from "../trips/types";

export const ModalType = {
  DELETE_TRIP: "DELETE_TRIP" as const,
  EDIT_TRIP: "EDIT_TRIP" as const,
};

export type ModalProps = {
  DELETE_TRIP: { trip: Trip };
  EDIT_TRIP: { trip: Trip };
};
