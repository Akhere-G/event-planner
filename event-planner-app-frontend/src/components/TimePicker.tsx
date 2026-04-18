import { useEffect, useRef } from "react";

const getHours = () => {
  const hours: number[] = [];
  for (let i = 0; i < 24; i++) {
    hours.push(i);
  }

  return hours;
};

const getMinutes = () => {
  const hours: number[] = [];
  for (let i = 0; i < 60; i++) {
    hours.push(i);
  }

  return hours;
};

export default function TimePicker({
  value,
  onChange,
  scrollToTime = true,
}: {
  value: string;
  onChange: (time: string) => void;
  scrollToTime?: boolean;
}) {
  const timeParts = value.split(":");
  const selectedHour = timeParts[0];

  const selectedMinute = timeParts[1];

  const hourContainerRef = useRef<HTMLDivElement>(null);
  const minuteContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!scrollToTime) return;

    const scrollToSelected = (container: HTMLDivElement | null, id: string) => {
      if (!container) return;
      const element = document.getElementById(id);
      if (element) {
        container.scrollTo({
          top: element.offsetTop - container.offsetTop,
          behavior: "smooth",
        });
      }
    };

    scrollToSelected(hourContainerRef.current, `hour-${selectedHour}`);
    scrollToSelected(minuteContainerRef.current, `minute-${selectedMinute}`);
  }, [selectedHour, selectedMinute, scrollToTime]);

  return (
    <div className="flex max-h-54">
      <div className="overflow-y-scroll flex-1" ref={hourContainerRef}>
        {getHours().map((hour) => {
          const hourStr = hour.toString().padStart(2, "0");
          return (
            <button
              id={"hour-" + hourStr}
              key={"hour-" + hourStr}
              onClick={() => onChange(`${hourStr}:${selectedMinute}`)}
              className={`rounded-none hover:bg-surface-muted ${selectedHour === hourStr ? "bg-brand-primary! text-white" : ""}`}
            >
              {hourStr}
            </button>
          );
        })}
      </div>
      <div className="overflow-y-scroll flex-1" ref={minuteContainerRef}>
        {getMinutes().map((minute) => {
          const minuteStr = minute.toString().padStart(2, "0");
          return (
            <button
              id={"minute-" + minuteStr}
              key={"minute-" + minuteStr}
              onClick={() => onChange(`${selectedHour}:${minuteStr}`)}
              className={`rounded-none hover:bg-surface-muted ${selectedMinute === minuteStr ? "bg-brand-primary! text-white" : ""}`}
            >
              {minuteStr}
            </button>
          );
        })}
      </div>
    </div>
  );
}
