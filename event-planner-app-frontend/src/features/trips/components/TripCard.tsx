import type { Trip } from "../types";
import { formatDateRange } from "../../../utils/dateFormattors";
import { MoreVertical } from "lucide-react";
import { isAdmin } from "../../users/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

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
  const { id, name, startDate, endDate } = trip;

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
        const target = e.target as HTMLElement;
        if (!target.closest("button") && !target.closest("[role='menuitem']")) {
          handleCardClick(id);
        }
      }}
    >
      <div className="relative bg-linear-to-r from-brand-primary to-brand-secondary ">
        {trip.backgroundImageUrl && (
          <img
            className="absolute w-full h-full object-cover"
            src={trip.backgroundImageUrl}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/40 to-transparent" />

        <div className="z-1 relative p-4  h-40">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-lg font-bold">{name}</h3>
            {isAdmin(trip.role) && (
              <DropdownMenu>
                <DropdownMenuTrigger className="-mt-2 -mr-2 p-2 hover:bg-white/20 rounded transition-colors">
                  <MoreVertical size={20} className="text-white" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleEdit}
                    className="text-text-primary"
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-error"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      <p className="z-20 p-4 text-text-primary bg-white">
        {formatDateRange(startDate, endDate)}
      </p>
    </article>
  );
}
