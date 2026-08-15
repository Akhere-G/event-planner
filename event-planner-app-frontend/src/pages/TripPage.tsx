import { useParams } from "react-router";
import { useGetTripQuery } from "../features/trips/services/tripsApiSlice";
import { StateGate } from "../components";
import { isFetchBaseQueryError } from "../features/api/utils";
import { TripDetails, TripMap } from "../features/trips/components";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { List, Map } from "lucide-react";
import type { RootState } from "../store";
import { setIsMapView } from "../features/maps/service/mapSlice";
import ViewUsersModal from "../features/modal/components/ViewUsersModal";

export default function TripPage() {
  const { isMapView } = useSelector((state: RootState) => state.map);

  const { tripId } = useParams();
  const { data, isLoading, isError, error } = useGetTripQuery(Number(tripId));
  const [showUsersModal, setShowUsersModal] = useState(false);
  const dispatch = useDispatch();

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
            className={`flex-1 z-1 max-h-screen absolute w-full md:shadow-[20px_0_30px_-10px_rgba(0,0,0,0.3)] transition-transform duration-300 md:max-w-[50%]  ${isMapView ? "translate-x-[-200%] invisible" : "visible"} md:static md:translate-x-0 md:visible`}
          >
            <div className="container  h-[93.5vh] 2xl:h-[96vh] overflow-y-scroll ">
              <TripDetails {...data?.data} />
            </div>
          </div>
          <div
            className={`flex-1 overflow-clip absolute w-full transition-transform duration-300 ${isMapView ? "visible" : "translate-x-[200%] invisible"} md:static md:translate-x-0 md:visible`}
          >
            <TripMap trip={data.data} />
          </div>
          <div className="z-1 fixed rounded-xl bottom-4 right-1/2 translate-x-1/2 md:hidden">
            <button
              onClick={() => {
                dispatch(setIsMapView(!isMapView));
              }}
              className="btn-secondary bg-brand-secondary text-text-inverse px-6 flex gap-2 items-center"
            >
              {isMapView ? (
                <>
                  <List size={20} />
                  <span>Plans view</span>
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
      {showUsersModal && (
        <ViewUsersModal open={true} onOpenChange={setShowUsersModal} />
      )}
    </StateGate>
  );
}
