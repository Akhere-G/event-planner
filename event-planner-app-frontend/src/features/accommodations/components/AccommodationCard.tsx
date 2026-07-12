import { useState } from "react";
import {
  MapPin,
  Calendar,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Accommodation } from "../types";
import { formatDateRange } from "../../../utils/dateFormattors";

interface AccommodationCardProps {
  accommodation: Accommodation;
  onUpdate: (accommodation: Accommodation) => void;
  onDelete: (accommodation: Accommodation) => void;
}

export default function AccommodationCard({
  accommodation,
  onUpdate,
  onDelete,
}: AccommodationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowExpand =
    accommodation.description && accommodation.description.length > 100;

  return (
    <div className="card p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-text-main text-lg">
            {accommodation.name}
          </h3>
          <div className="flex items-center gap-2 text-text-secondary text-sm mt-1">
            <MapPin size={14} />
            <span>{accommodation.address}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-sm mt-1">
            <Calendar size={14} />
            <span>
              {formatDateRange(accommodation.startDate, accommodation.endDate)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate(accommodation)}
            className="p-2 hover:bg-surface-muted rounded-md text-text-secondary hover:text-text-primary transition-colors"
            title="Update"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(accommodation)}
            className="p-2 hover:bg-surface-muted rounded-md text-text-secondary hover:text-error transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {accommodation.description && (
        <div className="text-sm text-text-secondary">
          {shouldShowExpand && !isExpanded ? (
            <>
              <p>{accommodation.description.slice(0, 100)}...</p>
              <button
                onClick={() => setIsExpanded(true)}
                className="text-brand-primary hover:underline mt-1 flex items-center gap-1"
              >
                <ChevronDown size={14} />
                Show more
              </button>
            </>
          ) : (
            <>
              <p>{accommodation.description}</p>
              {shouldShowExpand && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-brand-primary hover:underline mt-1 flex items-center gap-1"
                >
                  <ChevronUp size={14} />
                  Show less
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
