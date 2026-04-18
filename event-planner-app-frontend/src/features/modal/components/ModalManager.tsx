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

  const SpecificModal = MODAL_COMPONENTS[modal.type];

  return (
    <div
      className="backdrop"
      onClick={() => {
        dispatch(closeModal());
        setSearchParams({});
      }}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="max-h-[90vh] overflow-y-scroll rounded-md">
          <SpecificModal {...modal.props} />
        </div>
      </div>
    </div>
  );
}
