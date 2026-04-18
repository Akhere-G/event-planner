import type { Trip } from "../types";
import { formatDateRange } from "../../../utils/dateFormattors";
import { MoreVertical } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { isAdmin } from "../../users/utils";

type TripCardProps = {
  trip: Trip;
  handleCardClick: (id: number) => void;
  openEditTripModal: (trip: Trip) => void;
  openDeleteTripModal: (trip: Trip) => void;
};

export default function TripCard({
  trip,
  handleCardClick,
  openEditTripModal,
  openDeleteTripModal,
}: TripCardProps) {
  const { id, name, description, startDate, endDate } = trip;

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSettings = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  const handleEdit = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    openEditTripModal(trip);
  };

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    openDeleteTripModal(trip);
  };

  return (
    <article
      className="relative rounded-md bg-surface shadow-md overflow-hidden cursor-pointer"
      onClick={() => handleCardClick(id)}
    >
      <div className="p-4  bg-linear-to-r from-brand-primary to-brand-secondary h-40">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white text-lg  font-bold ">{name}</h3>
          {isAdmin(trip.role) && (
            <button
              className="-mt-2 -mr-2 p-2 hover:bg-white/20"
              onClick={handleSettings}
            >
              <MoreVertical size={20} className="text-white" />
            </button>
          )}
          {isMenuOpen && (
            <div className="absolute top-8 right-4 mt-2 w-32 bg-white rounded-md shadow-lg z-10 flex flex-col text-sm border border-gray-100">
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-left hover:bg-gray-50 text-text-primary"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-left hover:bg-gray-50 text-error"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        <p className="text-surface-muted truncate">{description}</p>
      </div>
      <p className="p-4 text-text-primary">
        {formatDateRange(startDate, endDate)}
      </p>
    </article>
  );
}
