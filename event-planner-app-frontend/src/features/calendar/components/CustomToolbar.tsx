import {
  endOfWeek,
  format,
  isSameMonth,
  isSameYear,
  startOfWeek,
} from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Views, type View } from "react-big-calendar";
import { FormSelect } from "../../../components";

interface CustomToolbarInterface {
  view: View;
  currentDate: Date;
  setCurrentDate: (newDate: Date) => void;
  setView: (view: View) => void;
}
export default function CustomToolbar({
  view,
  currentDate,
  setCurrentDate,
  setView,
}: CustomToolbarInterface) {
  const goToBack = () => {
    const m = new Date(currentDate);
    if (view === Views.MONTH) {
      m.setMonth(m.getMonth() - 1);
    } else if (view === Views.WEEK) {
      m.setDate(m.getDate() - 7);
    } else {
      m.setDate(m.getDate() - 1);
    }
    setCurrentDate(m);
  };
  const goToNext = () => {
    const m = new Date(currentDate);
    if (view === Views.MONTH) {
      m.setMonth(m.getMonth() + 1);
    } else if (view === Views.WEEK) {
      m.setDate(m.getDate() + 7);
    } else {
      m.setDate(m.getDate() + 1);
    }
    setCurrentDate(m);
  };
  let dateStr = format(currentDate, "MMMM yyyy");

  if (view === Views.WEEK) {
    const startWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    const endWeek = endOfWeek(currentDate, { weekStartsOn: 1 });
    const sameMonth = isSameMonth(endWeek, startWeek);
    const sameYear = isSameYear(endWeek, startWeek);
    let formatStr = "do";
    if (!sameMonth) formatStr += " MMM";
    if (!sameYear) formatStr += " yyyy";
    dateStr = `${format(startWeek, formatStr)} - ${format(endWeek, "do MMM yyyy")}`;
  }
  if (view === Views.DAY) {
    dateStr = format(currentDate, "do MMM yyyy");
  }

  return (
    <div className="flex flex-wrap justify-between items-center mb-4 flex-col gap-2 lg:flex-row">
      <div className="flex items-center gap-2">
        <CalendarIcon className="text-brand-primary" size={20} />
        <h2 className="text-lg font-bold text-text-primary">{dateStr}</h2>
      </div>

      <div className="flex gap-4 items ">
        <FormSelect
          value={view}
          onChange={(e) => setView(e.target.value as View)}
          name="view"
          options={[
            { value: Views.MONTH, name: "Month" },
            { value: Views.WEEK, name: "Week" },
            { value: Views.DAY, name: "Day" },
          ]}
        />

        <div className="flex h-11.5 px-1 rounded-lg   text-text-inverse items-center">
          <button
            aria-label={`Go to previous ${view === Views.MONTH ? "month" : view === Views.WEEK ? "week" : "day"}`}
            onClick={goToBack}
            className="btn-primary py-3 h-11 rounded-r-none active:scale-100"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Go to current date"
            onClick={() => setCurrentDate(new Date())}
            className="btn-primary py-2 h-11 rounded-none border-x active:scale-100"
          >
            Today
          </button>
          <button
            aria-label={`Go to next ${view === Views.MONTH ? "month" : view === Views.WEEK ? "week" : "day"}`}
            onClick={goToNext}
            className="btn-primary py-3 h-11 rounded-l-none active:scale-100"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
