import { Calendar } from "lucide-react";
import type { Trip } from "../types";
import { formatDateRange } from "../../../utils/dateFormattors";
import { UserAvatarList } from "../../users/components";

export default function TripSummary({
  name,
  description,
  startDate,
  endDate,
  userMemberships,
}: Trip) {
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
          <div>
            <UserAvatarList users={userMemberships} />
          </div>
        </div>
      </div>
    </div>
  );
}
