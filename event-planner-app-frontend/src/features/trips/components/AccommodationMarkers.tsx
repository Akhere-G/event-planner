import { useParams } from "react-router";
import { useGetAccommodationsQuery } from "../../accommodations/apiSlice";
import AccommodationMarker from "./AccommodationMarker";
import { useState } from "react";
import type { Accommodation } from "../../accommodations/types";
import { X } from "lucide-react";
import AccommodationCard from "../../accommodations/components/AccommodationCard";

export default function AccommodationMarkers() {
  const params = useParams();
  const tripId = Number(params.tripId);
  const { data } = useGetAccommodationsQuery(tripId);
  const [selectedAccom, setSelectAccom] = useState<Accommodation | null>();

  const accommodations = data?.data ?? [];
  return (
    <div className="relative">
      {accommodations.map((accommodation) => (
        <AccommodationMarker
          key={accommodation.id}
          accommodation={accommodation}
          onSelect={(accommodation) => setSelectAccom(accommodation)}
          isSelected={selectedAccom === accommodation}
        />
      ))}
      {selectedAccom && (
        <div className={`z-2 absolute bottom-0 px-2 md:px-4 pb-5 w-full`}>
          <button
            onClick={() => setSelectAccom(null)}
            className="absolute btn-secondary p-1 right-0 -top-4 md:-top-4"
          >
            <X size={20} />
          </button>
          <AccommodationCard
            accommodation={selectedAccom}
            deleteFuncProps={{ onSuccess: () => setSelectAccom(null) }}
          />
        </div>
      )}
    </div>
  );
}
