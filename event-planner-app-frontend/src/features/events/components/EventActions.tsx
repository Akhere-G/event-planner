import { Route } from "lucide-react";
import { setRoute } from "../../maps/service/mapSlice";
import { useDispatch } from "react-redux";
import type { Event } from "../types";
import { useState } from "react";
import { TravelModes } from "../../maps/constants";

export default function EventActions({ from, to }: { from: Event; to: Event }) {
  const [mode, setMode] = useState(google.maps.TravelMode.WALKING);
  const dispatch = useDispatch();

  return (
    <div className="flex justify-start items-center gap-2">
      <button
        onClick={() => dispatch(setRoute({ from, to, mode }))}
        className="btn p-1 transition-colors hover:bg-surface-muted flex gap-1 items-center"
      >
        <Route size={12} />
        <span className="text-xs font-normal">Directions</span>
      </button>
      <div>
        <select
          className="flex-0 text-xs p-0 border-none "
          onChange={(e) => setMode(e.target.value as google.maps.TravelMode)}
        >
          {TravelModes.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
