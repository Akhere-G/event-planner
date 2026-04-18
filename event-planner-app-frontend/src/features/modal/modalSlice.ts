import { createSlice } from "@reduxjs/toolkit";
import { type ModalProps, type ModalState } from "./types";

type ModalDataType =
  | {
      type: "EDIT_TRIP";
      props: ModalProps["EDIT_TRIP"];
    }
  | {
      type: "DELETE_TRIP";
      props: ModalProps["DELETE_TRIP"];
    }
  | {
      type: "VIEW_TRIP";
      props: ModalProps["VIEW_TRIP"];
    };

const initialState: ModalState = {
  modal: null,
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state, action: { payload: ModalDataType }) => {
      state.modal = action.payload as ModalState["modal"];
    },
    closeModal: (state) => {
      state.modal = null;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;

export const selectModal = (state: { modal: ModalState }) => state.modal;
