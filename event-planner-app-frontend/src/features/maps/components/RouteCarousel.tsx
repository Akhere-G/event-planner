import { useRef, useState } from "react";
import {
  X,
  Navigation,
  Clock,
  Route as RouteIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { Route } from "../types";
import { EditableSelect } from "../../../components";
import { TravelModes } from "../constants";

interface RouteCarouselProps {
  routes: Route[];
  legResults: (google.maps.DirectionsResult | null)[];
  onClose: () => void;
  onUpdateMode: (index: number, mode: string) => void;
}

export default function RouteCarousel({
  routes,
  legResults,
  onClose,
  onUpdateMode,
}: RouteCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isSingleRoute = routes.length === 1;

  const scrollToIndex = (direction: "next" | "prev") => {
    if (!scrollRef.current) return;

    const cardWidth = scrollRef.current.offsetWidth;
    const newIndex = direction === "next" ? activeIndex + 1 : activeIndex - 1;

    if (newIndex >= 0 && newIndex < routes.length) {
      scrollRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth",
      });
      setActiveIndex(newIndex);
    }
  };

  return (
    <div className="fixed bottom-6 left-0 w-full z-20 pointer-events-none">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-center mb-3 pointer-events-auto">
          {!isSingleRoute && (
            <div className="flex gap-2">
              <button
                onClick={() => scrollToIndex("prev")}
                disabled={activeIndex === 0}
                className="btn-primary p-2 rounded-full shadow-md disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scrollToIndex("next")}
                disabled={activeIndex === routes.length - 1}
                className="btn-primary p-2 rounded-full shadow-md disabled:opacity-30"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          <button onClick={onClose} className="card p-2 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex overflow-x-hidden snap-x snap-mandatory pointer-events-auto"
        >
          {routes.map((route, idx) => {
            const apiData = legResults[idx]?.routes[0]?.legs[0];

            return (
              <div
                key={idx}
                className={`
                  snap-center shrink-0 p-1 
                  ${isSingleRoute ? "w-full" : "w-full pr-4"}
                `}
              >
                <div className="card min-h-55 max-h-[40vh] flex flex-col">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <span className="text-[10px] font-bold uppercase">
                      Leg {idx + 1} of {routes.length}
                    </span>
                    <EditableSelect
                      canEdit={true}
                      selectedValue={route.mode}
                      options={TravelModes}
                      setValue={(newMode) => onUpdateMode(idx, newMode)}
                      selectClassName="w-32 flex flex-col"
                      defaultElement={
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-brand-primary rounded-full px-6 py-2 text-text-inverse">
                          <Navigation size={12} /> {route.mode}
                        </span>
                      }
                    />
                  </div>

                  {!apiData ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="animate-spin text-brand-primary" />
                    </div>
                  ) : (
                    <div className="flex flex-col h-full overflow-hidden">
                      <div className="flex gap-4 mb-4">
                        <div className="text-brand-primary bg-surface-muted flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-lg">
                          <Clock size={16} /> {apiData.duration?.text}
                        </div>
                        <div className="text-brand-primary bg-surface-muted flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-lg">
                          <RouteIcon size={16} /> {apiData.distance?.text}
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto pr-2 text-sm text-gray-600 custom-scrollbar">
                        {apiData.steps?.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="mb-2 pb-2 border-b text-text-primary border-surface-border last:border-0"
                            dangerouslySetInnerHTML={{
                              __html: step.instructions,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
