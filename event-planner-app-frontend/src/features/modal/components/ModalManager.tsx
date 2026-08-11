/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector } from "react-redux";
import { selectModal } from "../modalSlice";
import { DeleteTripModal, EditTripModal, ViewUsersModal } from "./";

const MODAL_COMPONENTS = {
  DELETE_TRIP: DeleteTripModal,
  EDIT_TRIP: EditTripModal,
  VIEW_USERS: ViewUsersModal,
};

export default function ModalManager() {
  const { modal } = useSelector(selectModal);

  if (!modal) return null;

  const SpecificModal = MODAL_COMPONENTS[
    modal.type
  ] as React.ComponentType<any>;

  return <SpecificModal {...(modal.props ?? {})} />;
}
