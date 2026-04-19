import { Accordion } from "../../../components";
import TripSummary from "../../trips/components/TripSummary";
import type { Invite } from "../types";
import { getStatusConfig } from "../utils";

export default function MyInviteCard({ invite }: { invite: Invite }) {
  console.log(invite.status);
  const { Icon, statusStyles, status } = getStatusConfig(
    invite.status,
    new Date(invite.expiresAt),
  );
  return (
    <div className="card p-0">
      <Accordion
        title={
          <div className=" flex items-center">
            <h2 className="text-lg">{invite.itinerary.name}</h2>
          </div>
        }
        content={
          <div className="p-4 pt-0">
            <TripSummary trip={invite.itinerary} hideTitle />
            <div className="flex justify-between items-end">
              <span
                className={`inline-flex items-center px-4 py-3 rounded-full border h-10 ${statusStyles}`}
              >
                <Icon size={12} className="mr-1" />
                {status}
              </span>
              <div className="flex justify-end gap-4 mt-4">
                <button className="btn-primary">Accept</button>
                <button className="btn-secondary hover:bg-error">
                  Decline
                </button>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}
