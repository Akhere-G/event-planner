/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch, useSelector } from "react-redux";
import { closeModal, selectModal } from "../modalSlice";
import { DeleteTripModal, EditTripModal, ViewUsersModal } from "./";
import { useSearchParams } from "react-router";

const MODAL_COMPONENTS = {
  DELETE_TRIP: DeleteTripModal,
  EDIT_TRIP: EditTripModal,
  VIEW_USERS: ViewUsersModal,
};

export default function ModalManager() {
  const [, setSearchParams] = useSearchParams();
  const { modal } = useSelector(selectModal);
  const dispatch = useDispatch();

  if (!modal) return null;

  const SpecificModal = MODAL_COMPONENTS[
    modal.type
  ] as React.ComponentType<any>;

  return (
    <div
      className="backdrop"
      onClick={() => {
        dispatch(closeModal());
        setSearchParams({});
      }}
    >
      <div
        className="modal border-surface-border border-2 rounded-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[90vh] overflow-y-scroll rounded-md bg-surface">
          <SpecificModal {...(modal.props ?? {})} />
        </div>
      </div>
    </div>
  );
}
