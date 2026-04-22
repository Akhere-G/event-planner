import { useParams, useSearchParams } from "react-router";
import { useGetTripQuery } from "../features/trips/services/tripsApiSlice";
import { StateGate } from "../components";
import { isFetchBaseQueryError } from "../features/api/utils";
import { TripDetails, TripMap } from "../features/trips/components";
import { openModal } from "../features/modal/modalSlice";
import { ModalType } from "../features/modal/types";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { isAdmin } from "../features/users/utils";
import { List, Map } from "lucide-react";

export default function TripPage() {
  const [isMapView, setIsMapView] = useState(false);
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
    <StateGate
      containerClasses="container"
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
      {data && (
        <div className="flex relative">
          <div
            className={`absolute w-full ${isMapView ? "translate-x-[-200%] invisible" : "visible"} md:static md:translate-x-0 visible`}
          >
            <div className="container h-[86.25vh] overflow-y-scroll">
              <TripDetails {...data?.data} />
            </div>
          </div>
          <div
            className={`absolute w-full ${isMapView ? "visible" : "translate-x-[200%] invisible"} md:static md:translate-x-0 visible`}
          >
            <TripMap />
          </div>
          <button
            onClick={() => setIsMapView((prev) => !prev)}
            className="btn-primary w-44 shadow-2xl fixed z-10 bottom-4 right-1/2 translate-x-1/2 flex gap-2 justify-center md:hidden"
          >
            {isMapView ? (
              <>
                <List size={20} />
                <span>Itinerary view</span>
              </>
            ) : (
              <>
                <Map size={20} />
                <span>Map View</span>
              </>
            )}
          </button>
        </div>
      )}
    </StateGate>
  );
}
