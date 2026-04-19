import { useParams, useSearchParams } from "react-router";
import { useGetTripQuery } from "../features/trips/services/tripsApiSlice";
import { StateGate } from "../components";
import { isFetchBaseQueryError } from "../features/api/utils";
import { TripDetails } from "../features/trips/components";
import { openModal } from "../features/modal/modalSlice";
import { ModalType } from "../features/modal/types";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { isAdmin } from "../features/users/utils";

export default function TripPage() {
  const { tripId } = useParams();
  const { data, isLoading, isError, error } = useGetTripQuery(Number(tripId));
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (searchParams.has("view") && isAdmin(data?.data.role ?? "")) {
      dispatch(openModal({ type: ModalType.VIEW_USERS, props: null }));
    }
  }, [dispatch, searchParams, data?.data.role]);

  return (
    <div className="container">
      <StateGate
        loadingStateProps={{ isLoading }}
        errorStateProps={{
          isError:
            isError && !(isFetchBaseQueryError(error) && error.status === 404),
          showReload: true,
        }}
        emptyStateProps={{
          isEmpty: isFetchBaseQueryError(error) && error.status === 404,
          message: "This trip could not be found.",
        }}
      >
        {data && <TripDetails {...data?.data} />}
      </StateGate>
    </div>
  );
}
