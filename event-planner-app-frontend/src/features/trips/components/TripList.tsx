import { useState } from "react";
import { Plus } from "lucide-react";
import type { Trip } from "../types";
import TripCard from "./TripCard";
import { Link, useNavigate } from "react-router";
import DeleteTripModal from "../../modal/components/DeleteTripModal";
import EditTripModal from "../../modal/components/EditTripModal";

type ModalType = "edit" | "delete" | null;

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
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const handleCardClick = (id: number) => {
    navigate(`/trips/${id}`);
  };

  function openEditTripModal(trip: Trip) {
    setSelectedTrip(trip);
    setModalType("edit");
  }

  function openDeleteTripModal(trip: Trip) {
    setSelectedTrip(trip);
    setModalType("delete");
  }

  function handleCloseModal() {
    setModalType(null);
    setSelectedTrip(null);
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
          className="border-brand-primary bg-surface border-2 h-full w-full md:rounded-md flex justify-center items-center gap-2 font-bold min-h-54"
        >
          <Plus className="text-brand-primary" />
          <p className="text-brand-primary">Add new trip</p>
        </Link>
      </div>
      {hasMore && (
        <button className="btn-primary" onClick={getMore}>
          Load More
        </button>
      )}
      {selectedTrip && modalType === "edit" && (
        <EditTripModal
          trip={selectedTrip}
          open={true}
          onOpenChange={handleCloseModal}
        />
      )}
      {selectedTrip && modalType === "delete" && (
        <DeleteTripModal
          trip={selectedTrip}
          open={true}
          onOpenChange={handleCloseModal}
        />
      )}
    </div>
  );
}
