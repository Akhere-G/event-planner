import { useParams } from "react-router";
import { useGetAccommodationsQuery } from "../../accommodations/accomodationApiSlice";
import AccommodationMarker from "./AccommodationMarker";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { setSelectedAccommodation } from "../service/mapSlice";
import AccommodationCard from "../../accommodations/components/AccommodationCard";
import { X } from "lucide-react";

export default function AccommodationMarkers() {
  const params = useParams();
  const tripId = Number(params.tripId);
  const { data } = useGetAccommodationsQuery(tripId);
  const dispatch = useDispatch();
  const selectedAccommodation = useSelector(
    (state: RootState) => state.map.selectedAccommodation,
  );

  const accommodations = data?.data ?? [];
  return (
    <>
      {accommodations.map((accommodation) => (
        <AccommodationMarker
          key={accommodation.id}
          accommodation={accommodation}
          onSelect={(accommodation) =>
            dispatch(setSelectedAccommodation(accommodation))
          }
          isSelected={selectedAccommodation?.id === accommodation.id}
        />
      ))}
      {selectedAccommodation && (
        <div className={`z-2 absolute bottom-0 px-2 md:px-4 pb-5 w-full`}>
          <button
            onClick={() => dispatch(setSelectedAccommodation(null))}
            className="absolute btn-secondary p-1 right-0 -top-4 md:-top-4"
          >
            <X size={20} />
          </button>
          <AccommodationCard
            accommodation={selectedAccommodation}
            key={selectedAccommodation.id}
            deleteFuncProps={{
              onSuccess: () => dispatch(setSelectedAccommodation(null)),
            }}
          />
        </div>
      )}
    </>
  );
}
