import { createEvents } from "ics";
import { toast } from "sonner";
import type { Event } from "../events/types";
import { differenceInHours, differenceInMinutes } from "date-fns";
import type { User } from "../users/types";

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
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.setAttribute("download", `${tripName.replace(/\s+/g, "_")}.ics`);
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  toast.success("Calendar exported!");
};
