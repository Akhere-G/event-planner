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
        <div className="flex relative overflow-x-clip">
          <div
            className={`flex-1 z-1 min-w-100 max-h-screen absolute w-full md:shadow-[20px_0_30px_-10px_rgba(0,0,0,0.3)] ${isMapView ? "translate-x-[-200%] invisible" : "visible"} md:static md:translate-x-0 md:visible`}
          >
            <div className="container   h-[calc(100vh-4.6rem)] overflow-y-scroll">
              <TripDetails {...data?.data} />
            </div>
          </div>
          <div
            className={`flex-1 md:h-[calc(100vh-4.6rem)] overflow-clip absolute  w-full ${isMapView ? "visible" : "translate-x-[200%] invisible"} md:static md:translate-x-0 md:visible`}
          >
            <TripMap
              latitude={data.data.latitude}
              longitude={data.data.longitude}
              events={data.data.events}
              role={data.data.role}
              tripId={data.data.id}
            />
          </div>
          <button
            onClick={() => setIsMapView((prev) => !prev)}
            className="z-1 btn-primary w-44 shadow-2xl fixed bottom-4 right-1/2 translate-x-1/2 flex gap-2 justify-center md:hidden"
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
