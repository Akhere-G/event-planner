import { useNavigate, useParams } from "react-router";
import { useJoinTripMutation } from "../features/invites/services/inviteApiSlice";
import { useEffect, useRef } from "react";
import { isApiError } from "../features/api/utils";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";

export default function JoinTrip() {
  const [joinTrip, { isLoading, error }] = useJoinTripMutation();
  const navigate = useNavigate();
  const { token } = useParams();
  const hasAttemptedJoin = useRef(false);
  const posthog = usePostHog();

  useEffect(() => {
    if (hasAttemptedJoin.current) return;
    hasAttemptedJoin.current = true;

    async function join() {
      try {
        if (!token) return navigate("/");
        const { data: invite } = await joinTrip({ token }).unwrap();
        posthog?.capture("trip_joined", {
          role: invite.role,
          trip_id: invite.itineraryId,
        });

        navigate(`/invites?inviteid=${invite.id}`);
      } catch (err) {
        if (isApiError(err)) {
          toast.error(err.data.message);
        }
      }
    }
    join();
  }, [token, navigate, joinTrip]);

  let title = "Joining trip...";

  if (error) {
    title = "Could not join trip.";
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="title mb-4">{title}</h2>
        {isLoading && <p> Loading...</p>}
        {isApiError(error) && (
          <>
            <p> {error.data.message || "Could not join trip."}</p>
          </>
        )}
      </div>
    </div>
  );
}
