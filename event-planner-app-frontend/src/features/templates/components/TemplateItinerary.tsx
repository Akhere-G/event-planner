import { BedDouble, Luggage, MapPin } from "lucide-react";
import { getDayColor } from "../../events/utils";
import type { TemplateDetail, TemplateWishlistItem } from "../types";
import { dayLabel, formatTemplateTimes } from "../utils";

function groupByWishlist(items: TemplateWishlistItem[]) {
  const groups = new Map<string, TemplateWishlistItem[]>();
  for (const item of items) {
    const group = groups.get(item.wishlistName) ?? [];
    group.push(item);
    groups.set(item.wishlistName, group);
  }
  return [...groups.entries()];
}

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
              {day.events.map((event, index) => (
                <li
                  key={index}
                  className="card border-l-4"
                  style={{ borderLeftColor: getDayColor(day.dayOffset) }}
                >
                  <div className="flex flex-wrap justify-between gap-x-4">
                    <p className="font-semibold">{event.name}</p>
                    <p className="text-sm text-text-secondary">
                      {formatTemplateTimes(event.startTime, event.endTime)}
                    </p>
                  </div>
                  <p className="text-sm text-text-secondary">
                    <span className="capitalize">{event.category}</span> ·{" "}
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
            <BedDouble size={18} aria-hidden /> Where to accommodation
          </h3>
          <ul className="flex flex-col gap-2">
            {accommodations.map((accommodation, index) => (
              <li key={index} className="card">
                <p className="font-semibold">{accommodation.name}</p>
                <p className="text-sm text-text-secondary">
                  {dayLabel(accommodation.startDayOffset)} to{" "}
                  {dayLabel(accommodation.endDayOffset)} ·{" "}
                  {accommodation.address}
                </p>
                {accommodation.description && (
                  <p className="text-sm mt-1">{accommodation.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {groupByWishlist(wishlistItems).map(([name, items]) => (
        <section key={name} aria-label={name}>
          <h3 className="title mb-2 flex items-center gap-2">
            <MapPin size={18} aria-hidden /> {name}
          </h3>
          <ul className="flex flex-col gap-2">
            {items.map((item, index) => (
              <li key={index} className="card">
                <p className="font-semibold">{item.name}</p>
                {item.address && (
                  <p className="text-sm text-text-secondary">{item.address}</p>
                )}
                {item.description && (
                  <p className="text-sm mt-1">{item.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {packingItems.length > 0 && (
        <section aria-label="Packing list">
          <h3 className="title mb-2 flex items-center gap-2">
            <Luggage size={18} aria-hidden /> Packing list
          </h3>
          <ul className="flex flex-wrap gap-2">
            {packingItems.map((item, index) => (
              <li key={index} className="card py-1 px-3 text-sm">
                {item.name}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
