import { Plus } from "lucide-react";
import type { Trip } from "../types";
import TripCard from "./TripCard";
import { Link, useNavigate } from "react-router";
import { openModal } from "../../modal/modalSlice";
import { useDispatch } from "react-redux";
import { ModalType } from "../../modal/types";

export default function TripList({
  trips,
  getMore,
  hasMore,
}: {
  trips: Trip[];
  getMore: () => void;
  hasMore: boolean;
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleCardClick = (id: number) => {
    navigate(`/trips/${id}`);
  };

  function openEditTripModal(trip: Trip) {
    dispatch(openModal({ type: ModalType.EDIT_TRIP, props: { trip } }));
  }

  function openDeleteTripModal(trip: Trip) {
    dispatch(openModal({ type: ModalType.DELETE_TRIP, props: { trip } }));
  }

  return (
    <div className="flex flex-col gap-4 justify-stretch md:items-start">
      <div className="w-full grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ">
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            handleCardClick={handleCardClick}
            openDeleteTripModal={openDeleteTripModal}
            openEditTripModal={openEditTripModal}
          />
        ))}
        <Link
          to="/addtrip"
          className="border-brand-primary border-2 h-full w-full rounded-md flex justify-center items-center gap-2 font-bold min-h-54"
        >
          <Plus className="text-brand-primary" />
          <p className="text-brand-primary">Add new itinerary</p>
        </Link>
      </div>
      {hasMore && (
        <button className="btn-primary" onClick={getMore}>
          Load More
        </button>
      )}
    </div>
  );
}
