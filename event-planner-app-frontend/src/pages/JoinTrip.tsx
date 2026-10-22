import { useNavigate, useParams } from "react-router";
import { useJoinTripMutation } from "../features/invites/services/inviteApiSlice";
import { useEffect, useRef } from "react";
import { isApiError } from "../features/api/utils";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";
import StateGate from "../components/StateGate";

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
        } else {
          posthog?.captureException(err);
          toast.error("Sorry! Something went wrong...");
        }
      }
    }
    join();
  }, [token, navigate, joinTrip, posthog]);

  const title = error ? "Could not join trip." : "Joining trip...";

  return (
    <div className="container">
      <div className="card">
        <h2 className="title mb-4">{title}</h2>
        <StateGate
          loadingStateProps={{ isLoading, message: "Joining trip..." }}
          errorStateProps={{
            isError: !!error,
            message: isApiError(error)
              ? error.data.message
              : "Could not join trip.",
          }}
        >
          <></>
        </StateGate>
      </div>
    </div>
  );
}
