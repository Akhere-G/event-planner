import { BedDouble, Luggage, MapPin } from "lucide-react";
import type { TemplateDetail } from "../types";
import { dayLabel, formatTemplateTimes } from "../utils";

export default function TemplateItinerary({
  template,
}: {
  template: TemplateDetail;
}) {
  const { days, accommodations, packingItems, wishlistItems } = template;

  return (
    <div className="flex flex-col gap-6">
      {days.map((day) => (
        <section key={day.dayOffset} aria-label={dayLabel(day.dayOffset)}>
          <h3 className="title mb-2">{dayLabel(day.dayOffset)}</h3>
          {day.events.length === 0 ? (
            <p className="text-text-secondary">Nothing planned.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {day.events.map((event, i) => (
                <li key={i} className="card">
                  <p className="font-semibold">{event.name}</p>
                  <p className="text-sm text-text-secondary">
                    {formatTemplateTimes(event.startTime, event.endTime)} ·{" "}
                    {event.address}
                  </p>
                  {event.description && (
                    <p className="text-sm mt-1">{event.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {accommodations.length > 0 && (
        <section aria-label="Stays">
          <h3 className="title mb-2 flex items-center gap-2">
            <BedDouble size={18} aria-hidden /> Stays
          </h3>
          <ul className="flex flex-col gap-2">
            {accommodations.map((stay, i) => (
              <li key={i} className="card">
                <p className="font-semibold">{stay.name}</p>
                <p className="text-sm text-text-secondary">
                  {dayLabel(stay.startDayOffset)} –{" "}
                  {dayLabel(stay.endDayOffset)} · {stay.address}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {wishlistItems.length > 0 && (
        <section aria-label="Places to consider">
          <h3 className="title mb-2 flex items-center gap-2">
            <MapPin size={18} aria-hidden /> Places to consider
          </h3>
          <ul className="flex flex-col gap-2">
            {wishlistItems.map((item, i) => (
              <li key={i} className="card">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-text-secondary">
                  {item.wishlistName}
                  {item.address ? ` · ${item.address}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {packingItems.length > 0 && (
        <section aria-label="Packing list">
          <h3 className="title mb-2 flex items-center gap-2">
            <Luggage size={18} aria-hidden /> Packing list
          </h3>
          <ul className="flex flex-wrap gap-2">
            {packingItems.map((item, i) => (
              <li key={i} className="card py-1 px-3 text-sm">
                {item.name}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
