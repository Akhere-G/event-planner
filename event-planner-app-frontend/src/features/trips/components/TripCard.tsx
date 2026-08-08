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
  const { id, name, description, startDate, endDate } = trip;

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
      <div className="p-4 bg-linear-to-r from-brand-primary to-brand-secondary h-40">
        <div className="flex items-center justify-between mb-2">
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
                <DropdownMenuItem onClick={handleDelete} className="text-error">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
