import { useDispatch, useSelector } from "react-redux";
import DeleteTripModal from "./DeleteTripModal";
import EditTripModal from "./EditTripModal";
import { closeModal, selectModal } from "../modalSlice";

const MODAL_COMPONENTS = {
  DELETE_TRIP: DeleteTripModal,
  EDIT_TRIP: EditTripModal,
};

export default function ModalManager() {
  const { modalType, modalProps } = useSelector(selectModal);
  const dispatch = useDispatch();

  if (!modalType) return null;

  const SpecificModal = MODAL_COMPONENTS[modalType];

  return (
    <div className="backdrop" onClick={() => dispatch(closeModal())}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <SpecificModal {...modalProps} />
      </div>
    </div>
  );
}
