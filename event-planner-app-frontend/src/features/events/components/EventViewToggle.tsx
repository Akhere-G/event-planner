import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import {
  setEventViewMode,
  type EventViewMode,
} from "../service/eventViewSlice";

interface ViewModeOption {
  mode: EventViewMode;
  label: string;
  shape: string;
}

const VIEW_MODE_OPTIONS: ViewModeOption[] = [
  { mode: "detailed", label: "Detailed", shape: "rounded-l-xl border-l-2" },
  { mode: "compact", label: "Compact", shape: "rounded-r-xl" },
];

export default function EventViewToggle() {
  const viewMode = useSelector((state: RootState) => state.eventView.mode);
  const dispatch = useDispatch();

  return (
    <div className="flex items-center" role="group" aria-label="Event view">
      {VIEW_MODE_OPTIONS.map(({ mode, label, shape }) => (
        <button
          key={mode}
          type="button"
          onClick={() => dispatch(setEventViewMode(mode))}
          className={`btn-secondary px-4 py-2 border-2 border-surface-border border-l-0 rounded-none active:scale-100 ${shape} ${
            viewMode === mode
              ? "brightness-110 bg-brand-primary/10 border-brand-primary/50 text-text-primary font-bold"
              : ""
          }`}
          aria-pressed={viewMode === mode}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
