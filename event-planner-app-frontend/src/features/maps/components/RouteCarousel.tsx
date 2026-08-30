import { useEffect, useRef } from "react";
import {
  X,
  Clock,
  Route as RouteIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ChevronDown,
} from "lucide-react";
import type { Route } from "../types";
import { EditableSelect } from "../../../components";
import { TravelModes } from "../constants";
import { useMap } from "@vis.gl/react-google-maps";
import { fitToBounds } from "../utils";

interface RouteCarouselProps {
  routes: Route[];
  legResults: (google.maps.DirectionsResult | null)[];
  onClose: () => void;
  onUpdateMode: (index: number, mode: string) => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

export default function RouteCarousel({
  routes,
  legResults,
  onClose,
  onUpdateMode,
  activeIndex,
  setActiveIndex,
}: RouteCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isSingleRoute = routes.length === 1;

  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const currentRoute = routes[activeIndex];

    fitToBounds({
      map,
      events: [currentRoute.from, currentRoute.to],
      padding: { top: 40, left: 50, bottom: 250, right: 30 },
    });
  }, [activeIndex, map, routes]);

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
  const currentRoute = routes[activeIndex];

  return (
    <div className="fixed bottom-2 left-0 w-full z-20">
      <div className="md:px-2">
        <div className="flex justify-between pointer-events-auto">
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
          className="flex overflow-x-hidden snap-x snap-mandatory pointer-events-auto "
        >
          {routes.map((route, idx) => {
            const apiData = legResults[idx]?.routes[0]?.legs[0];

            return (
              <div
                key={idx}
                className={`
                  snap-center min-w-screen
                  ${isSingleRoute ? "w-full pr-4" : "w-full "}
                `}
              >
                <div className="card h-55 flex flex-col w-[calc(100vw-1rem)]">
                  <div className="flex justify-between items-end mb-4 pb-2 border-b gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.625rem] font-bold uppercase">
                        Leg {idx + 1} of {routes.length}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {currentRoute.from.name} - {currentRoute.to.name}
                      </span>
                    </div>
                    <EditableSelect
                      canEdit={true}
                      selectedValue={route.mode}
                      options={TravelModes}
                      setValue={(newMode) => onUpdateMode(idx, newMode)}
                      selectClassName="w-32 flex flex-col"
                      defaultElement={
                        <span className="flex items-center gap-1 text-[10px] bg-brand-primary rounded-md px-4 py-2 font-bold text-text-inverse">
                          {route.mode}
                          <ChevronDown size={16} />
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
                      <div className="flex gap-4 mb-2">
                        <div className="text-brand-primary bg-surface-muted flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg">
                          <Clock size={12} /> {apiData.duration?.text}
                        </div>
                        <div className="text-brand-primary bg-surface-muted flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg">
                          <RouteIcon size={12} /> {apiData.distance?.text}
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto pr-2 text-sm">
                        {apiData.steps?.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="grid grid-cols-12 gap-1 mb-2 pb-2 border-b text-text-primary text-sm border-surface-border last:border-0 items-baseline"
                          >
                            {step.duration && (
                              <p className="text-xs mr-1 col-1">
                                {step.duration.text}
                              </p>
                            )}

                            <p className="col-span-11">
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: step.instructions,
                                }}
                              />
                              {step.travel_mode === "TRANSIT" && (
                                <span>
                                  {" "}
                                  from
                                  <span className="font-bold">
                                    {" "}
                                    {step.transit?.arrival_stop.name}{" "}
                                  </span>
                                  to
                                  <span className="font-bold">
                                    {" "}
                                    {step.transit?.departure_stop.name}{" "}
                                  </span>
                                  via
                                  <span className="font-bold">
                                    {" "}
                                    {step.transit?.line.short_name}
                                  </span>
                                </span>
                              )}
                            </p>
                          </div>
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
