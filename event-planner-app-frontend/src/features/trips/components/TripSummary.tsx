import { Calendar, UserCog } from "lucide-react";
import type { Trip } from "../types";
import { formatDateRange } from "../../../utils/dateFormattors";
import { UserAvatarList } from "../../users/components";
import { useDispatch } from "react-redux";
import { openModal } from "../../modal/modalSlice";
import { ModalType } from "../../modal/types";

export default function TripSummary({
  name,
  description,
  startDate,
  endDate,
  userMemberships,
}: Trip) {
  const dispatch = useDispatch();
  function openUsersView() {
    dispatch(openModal({ type: ModalType.VIEW_USERS, props: null }));
  }
  return (
    <div>
      <div className="card flex flex-col gap-6">
        <div>
          <h2 className="title">{name}</h2>
          <p className="text-text-secondary">{description}</p>
        </div>
        <div className="flex justify-between">
          <div className="flex gap-2 items-center">
            <Calendar size={20} /> {formatDateRange(startDate, endDate)}
          </div>
          <div className="flex gap-1">
            <UserAvatarList users={userMemberships} />
            <button
              className="p-2"
              aria-label="View Users"
              onClick={openUsersView}
            >
              <UserCog aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
