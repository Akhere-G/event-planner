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
        <div className="flex relative overflow-x-clip isolate">
          <div
            className={`flex-1 max-h-screen absolute w-full md:shadow-[20px_0_30px_-10px_rgba(0,0,0,0.3)] transition-transform duration-300 ${isMapView ? "translate-x-[-200%] invisible" : "visible"} md:static md:translate-x-0 md:visible`}
          >
            <div className="container  h-[93.5vh] 2xl:h-[96vh] overflow-y-scroll">
              <TripDetails {...data?.data} />
            </div>
          </div>
          <div
            className={`flex-1 overflow-clip absolute w-full transition-transform duration-300 ${isMapView ? "visible" : "translate-x-[200%] invisible"} md:static md:translate-x-0 md:visible`}
          >
            <TripMap trip={data.data} />
          </div>
          <div className="fixed rounded-xl bg-surface bottom-4 right-1/2 translate-x-1/2 md:hidden">
            <button
              onClick={() => setIsMapView((prev) => !prev)}
              className="btn-secondary bg-brand-secondary/20 hover:brightness-140 border-surface-border border w-44 shadow-2xl  flex gap-2 justify-center "
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
        </div>
      )}
    </StateGate>
  );
}
