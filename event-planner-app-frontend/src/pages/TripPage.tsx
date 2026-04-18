import { useParams, useSearchParams } from "react-router";
import { useGetTripQuery } from "../features/trips/services/tripsApiSlice";
import { EmptyState, ErrorState, LoadingState } from "../components";
import { isFetchBaseQueryError } from "../features/api/utils";
import { TripDetails } from "../features/trips/components";
import { openModal } from "../features/modal/modalSlice";
import { ModalType } from "../features/modal/types";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

export default function TripPage() {
  const { tripId } = useParams();
  const { data, isLoading, isError, error } = useGetTripQuery(Number(tripId));
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (searchParams.has("view")) {
      dispatch(openModal({ type: ModalType.VIEW_USERS, props: null }));
    }
  }, [dispatch, searchParams]);

  let mainContent = <></>;
  if (isLoading) {
    mainContent = <LoadingState />;
  } else if (isFetchBaseQueryError(error) && error.status === 404) {
    mainContent = <EmptyState message="This trip could not be found." />;
  } else if (isError) {
    mainContent = <ErrorState showReload />;
  } else {
    mainContent = <TripDetails {...data.data} />;
  }
  return <div className="container">{mainContent}</div>;
}
