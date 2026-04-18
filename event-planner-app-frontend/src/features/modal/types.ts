import type { Trip } from "../trips/types";

export const ModalType = {
  DELETE_TRIP: "DELETE_TRIP" as const,
  EDIT_TRIP: "EDIT_TRIP" as const,
  VIEW_USERS: "VIEW_USERS" as const,
};

export type ModalProps = {
  DELETE_TRIP: { trip: Trip };
  EDIT_TRIP: { trip: Trip };
  VIEW_USERS: null;
};

export type ModalDataType =
  | { type: typeof ModalType.DELETE_TRIP; props: ModalProps["DELETE_TRIP"] }
  | { type: typeof ModalType.EDIT_TRIP; props: ModalProps["EDIT_TRIP"] }
  | { type: typeof ModalType.VIEW_USERS; props: ModalProps["VIEW_USERS"] };

export interface ModalState {
  modal: ModalDataType | null;
}
