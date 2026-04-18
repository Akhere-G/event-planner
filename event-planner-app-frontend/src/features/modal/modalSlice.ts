import { createSlice } from "@reduxjs/toolkit";
import { type ModalDataType, type ModalState } from "./types";

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
