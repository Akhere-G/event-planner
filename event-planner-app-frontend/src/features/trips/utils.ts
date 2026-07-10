import {
  Document,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { createEvents } from "ics";
import { differenceInHours, differenceInMinutes, format, parseISO } from "date-fns";
import { toast } from "sonner";
import type { Day, Event } from "../events/types";
import { makeDays } from "../events/utils";
import type { User } from "../users/types";
import { formatDateRange } from "../../utils/dateFormattors";
import type { Trip } from "./types";

function buildGoogleMapsUrl(event: Event): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.name)},${encodeURIComponent(event.address)}`;
}

function sortEventsByStart(events: Event[]): Event[] {
  return [...events].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
}

function buildTripHeaderParagraphs(trip: Trip): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({ text: trip.name, heading: HeadingLevel.HEADING_1 }),
    new Paragraph({
      children: [new TextRun(`Destination: ${trip.destination}`)],
    }),
    new Paragraph({
      children: [
        new TextRun(`Dates: ${formatDateRange(trip.startDate, trip.endDate)}`),
      ],
    }),
  ];
  if (trip.description) {
    paragraphs.push(
      new Paragraph({ children: [new TextRun(trip.description)] }),
    );
  }
  return paragraphs;
}

function buildEventParagraphs(event: Event): Paragraph[] {
  const time = `${format(parseISO(event.startAt), "p")} – ${format(parseISO(event.endAt), "p")}`;
  const paragraphs: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({ text: `${time}  ` }),
        new TextRun({ text: event.name, bold: true }),
      ],
    }),
    new Paragraph({
      children: [new TextRun(`Location: ${event.address}`)],
    }),
    new Paragraph({
      children: [
        new ExternalHyperlink({
          link: buildGoogleMapsUrl(event),
          children: [
            new TextRun({ text: "Open in Maps", style: "Hyperlink" }),
          ],
        }),
      ],
    }),
  ];
  if (event.category) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun(`Category: ${event.category}`)],
      }),
    );
  }
  if (event.description) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun(`Notes: ${event.description}`)],
      }),
    );
  }
  paragraphs.push(new Paragraph({ text: "" }));
  return paragraphs;
}

function buildDayParagraphs(day: Day): Paragraph[] {
  const dayLabel = format(parseISO(day.date), "EEE d MMM");
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: `Day ${day.day} — ${dayLabel}`,
      heading: HeadingLevel.HEADING_2,
    }),
  ];
  const sorted = sortEventsByStart(day.events);
  if (sorted.length === 0) {
    paragraphs.push(
      new Paragraph({ children: [new TextRun("No activities planned.")] }),
    );
    return paragraphs;
  }
  for (const event of sorted) {
    paragraphs.push(...buildEventParagraphs(event));
  }
  return paragraphs;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function exportToDoc(trip: Trip): Promise<void> {
  try {
    const days = makeDays(trip.events, trip.startDate, trip.endDate);
    const children: Paragraph[] = [
      ...buildTripHeaderParagraphs(trip),
      ...days.flatMap(buildDayParagraphs),
    ];
    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    const filename = `${trip.name.replace(/\s+/g, "_")}.docx`;
    downloadBlob(blob, filename);
    toast.success("Itinerary exported!");
  } catch {
    toast.error("Could not export.");
  }
}

export const exportToCalendar = (
  tripName: string,
  tripEvents: Event[],
  tripMembers: User[],
) => {
  const events = tripEvents.map((event) => {
    const start = new Date(event.startAt);
    const hours = differenceInHours(event.endAt, event.startAt, {
      roundingMethod: "floor",
    });
    const minutes = differenceInMinutes(event.endAt, event.startAt) % 60;
    const attendees =
      tripMembers.length > 1
        ? tripMembers.map((user) => ({
            name: user.username,
            email: user.email,
            role:
              user.role === "admin"
                ? ("CHAIR" as const)
                : ("REQ-PARTICIPANT" as const),
            rsvp: true,
          }))
        : undefined;

    return {
      start: [
        start.getFullYear(),
        start.getMonth() + 1,
        start.getDate(),
        start.getHours(),
        start.getMinutes(),
      ] as const satisfies [number, number, number, number, number],
      duration: { hours, minutes },
      title: event.name,
      description: event.description ?? event.name,
      location: event.address,
      geo: { lat: event.latitude, lon: event.longitude },
      categories: [event.category],
      status: "CONFIRMED" as const,
      busyStatus: "BUSY" as const,
      attendees,
    };
  });
  const { error, value } = createEvents(events);

  if (error) {
    toast.error("Could not export.");
    return;
  }

  const blob = new Blob([value!], { type: "text/calendar" });
  downloadBlob(blob, `${tripName.replace(/\s+/g, "_")}.ics`);
  toast.success("Calendar exported!");
};
