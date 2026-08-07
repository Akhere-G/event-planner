import { useParams } from "react-router";
import { useGetAccommodationsQuery } from "../../accommodations/apiSlice";
import AccommodationMarker from "./AccommodationMarker";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { setSelectedAccommodation } from "../../maps/service/mapSlice";

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
    </>
  );
}
