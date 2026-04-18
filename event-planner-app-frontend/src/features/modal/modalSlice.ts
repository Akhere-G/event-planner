import { createSlice } from "@reduxjs/toolkit";

export interface ModalState {
  modalType: string | null;
  modalProps: object;
}

export const modalSlice = createSlice({
  name: "modal",
  initialState: { modalType: null, modalProps: {} },
  reducers: {
    openModal: (state, action) => {
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
