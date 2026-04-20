import type { Trip } from "../types";
import { formatDateRange } from "../../../utils/dateFormattors";
import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
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

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

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
      ref={menuRef}
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
            <div className="absolute top-8 right-4 mt-2 w-32 bg-surface rounded-md shadow-lg z-10 flex flex-col text-sm">
              <button onClick={handleEdit} className="btn-menu">
                Edit
              </button>
              <button onClick={handleDelete} className="btn-menu text-error">
                Delete
              </button>
            </div>
          )}
        </div>
        <p className="text-slate-200 dark:text-text-secondary truncate">
          {description}
        </p>
      </div>
      <p className="p-4 text-text-primary">
        {formatDateRange(startDate, endDate)}
      </p>
    </article>
  );
}
