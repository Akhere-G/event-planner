import { createSlice } from "@reduxjs/toolkit";
import { type ModalProps } from "./types";

type ModalDataType =
  | {
      type: "EDIT_TRIP";
      props: ModalProps[keyof ModalProps];
    }
  | {
      type: "DELETE_TRIP";
      props: ModalProps[keyof ModalProps];
    };

export interface ModalState {
  modalType: ModalDataType["type"] | null;
  modalProps: ModalDataType["props"] | null;
}

export const modalSlice = createSlice({
  name: "modal",
  initialState: { modalType: null, modalProps: {} },
  reducers: {
    openModal: (state, action: { payload: ModalDataType }) => {
      state.modalType = action.payload.type;
      state.modalProps = action.payload.props;
    },
    closeModal: (state) => {
      state.modalType = null;
      state.modalProps = {};
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;

export const selectModal = (state: { modal: ModalState }) => state.modal;
