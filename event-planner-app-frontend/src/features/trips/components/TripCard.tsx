import type { Trip } from "../types";
import { formatDateRange } from "../../../utils/dateFormattors";
import { MoreVertical } from "lucide-react";
import { isAdmin } from "../../users/utils";
import useMenu from "../../../hooks/useMenu";

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

  const { toggleMenu, isMenuOpen, menuContainerRef, openButtonRef } = useMenu({
    closeOnClick: true,
  });
  const handleSettings = () => {
    toggleMenu();
  };

  const handleEdit = () => {
    openEditTripModal(trip);
  };

  const handleDelete = () => {
    openDeleteTripModal(trip);
  };

  return (
    <article
      className="relative md:rounded-md bg-surface shadow-md overflow-hidden cursor-pointer"
      onClick={(e) => {
        if (
          !openButtonRef.current?.contains(e.target as Node) &&
          !menuContainerRef.current?.contains(e.target as Node)
        ) {
          handleCardClick(id);
        }
      }}
    >
      <div className="p-4  bg-linear-to-r from-brand-primary to-brand-secondary h-40">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white text-lg font-bold">{name}</h3>
          {isAdmin(trip.role) && (
            <button
              ref={openButtonRef}
              className="-mt-2 -mr-2 p-2 hover:bg-white/20"
              onClick={handleSettings}
            >
              <MoreVertical size={20} className="text-white" />
            </button>
          )}
          {isMenuOpen && (
            <div
              ref={menuContainerRef}
              className="absolute top-8 right-4 mt-2 w-32 bg-surface rounded-md shadow-lg z-10 flex flex-col text-sm"
            >
              <button onClick={handleEdit} className="btn-menu rounded-md">
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="btn-menu rounded-md text-error"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        <p className="text-text-inverse/85 truncate">{description}</p>
      </div>
      <p className="p-4 text-text-primary">
        {formatDateRange(startDate, endDate)}
      </p>
    </article>
  );
}
