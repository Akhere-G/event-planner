import { toast } from "sonner";
import { Accordion } from "../../../components";
import { isFetchBaseQueryError } from "../../api/utils";
import TripSummary from "../../trips/components/TripSummary";
import {
  useAcceptInviteMutation,
  useDeclineInviteMutation,
} from "../services/inviteApiSlice";
import type { Invite } from "../types";
import { getStatusConfig } from "../utils";
import { Link } from "react-router";
import { usePostHog } from "@posthog/react";

export default function MyInviteCard({ invite }: { invite: Invite }) {
  const [accept, { isLoading: isAcceptLoading }] = useAcceptInviteMutation();
  const [decline, { isLoading: isDeclineLoading }] = useDeclineInviteMutation();
  const posthog = usePostHog();

  const { Icon, statusStyles, status } = getStatusConfig(
    invite.status,
    new Date(invite.expiresAt),
  );

  const acceptInvite = async () => {
    try {
      await accept({ inviteId: invite.id, token: invite.token ?? "" }).unwrap();
      posthog?.capture("invite_accepted", {
        role: invite.role,
        trip_id: invite.itineraryId,
      });
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        toast.error((err.data as { message: string }).message);
      } else {
        posthog?.captureException(err);
        toast.error("Sorry! Something went wrong...");
      }
    }
  };

  const declineInvite = async () => {
    try {
      await decline({
        inviteId: invite.id,
        token: invite.token ?? "",
      }).unwrap();
      posthog?.capture("invite_declined", {
        role: invite.role,
        trip_id: invite.itineraryId,
      });
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        toast.error((err.data as { message: string }).message);
      } else {
        posthog?.captureException(err);
        toast.error("Sorry! Something went wrong...");
      }
    }
  };

  const canAcceptOrDecline = ["pending", "expired"].includes(status);
  const isAccepted = status === "accepted";

  return (
    <div className="card p-0">
      <Accordion
        TitleComponent={() => (
          <div className=" flex items-center">
            {isAccepted ? (
              <Link
                onClick={(e) => e.stopPropagation()}
                to={`/trips/${invite.itinerary!.id}`}
                className="text-lg"
              >
                {invite.itinerary!.name}
              </Link>
            ) : (
              <h2 className="text-lg">{invite.itinerary!.name}</h2>
            )}
          </div>
        )}
        ContentComponent={() => (
          <div className="p-4 pt-0">
            {invite.itinerary && (
              <TripSummary trip={invite.itinerary} hideTitle />
            )}
            <div className="flex justify-between items-end">
              <span
                className={`inline-flex items-center px-4 py-3 rounded-full border h-10 ${statusStyles}`}
              >
                <Icon size={12} className="mr-1" />
                {status}
              </span>
              {canAcceptOrDecline && (
                <div className="flex justify-end gap-4 mt-4">
                  <button
                    onClick={acceptInvite}
                    disabled={isAcceptLoading || isDeclineLoading}
                    className="btn-primary"
                  >
                    Accept
                  </button>
                  <button
                    onClick={declineInvite}
                    disabled={isAcceptLoading || isDeclineLoading}
                    className="btn-secondary hover:bg-error"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      />
    </div>
  );
}
