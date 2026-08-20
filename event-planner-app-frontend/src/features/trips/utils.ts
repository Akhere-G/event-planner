import {
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  UnderlineType,
  VerticalAlignTable,
  WidthType,
} from "docx";
import { createEvents } from "ics";
import { differenceInHours, differenceInMinutes, format } from "date-fns";
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

type DocThemeColors = {
  canvas: string;
  surface: string;
  surfaceBorder: string;
  brandPrimary: string;
  textCanvas: string;
  textPrimary: string;
  textInverse: string;
};

const DEFAULT_THEME: DocThemeColors = {
  canvas: "#f8fafc",
  surface: "#ffffff",
  surfaceBorder: "#e2e8f0",
  brandPrimary: "#f97316",
  textCanvas: "#0f172a",
  textPrimary: "#0f172a",
  textInverse: "#ffffff",
};

const HALF_INCH_TWIPS = 720;

function normalizeHexColor(
  value: string,
  fallback = DEFAULT_THEME.textPrimary,
): string {
  const trimmed = value.trim();
  const withoutHash = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;

  if (/^[0-9a-fA-F]{3}$/.test(withoutHash)) {
    return withoutHash
      .split("")
      .map((character) => `${character}${character}`)
      .join("")
      .toUpperCase();
  }

  if (/^[0-9a-fA-F]{6}$/.test(withoutHash)) {
    return withoutHash.toUpperCase();
  }

  const rgbMatch = trimmed.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i,
  );
  if (rgbMatch) {
    return rgbMatch
      .slice(1, 4)
      .map((component) =>
        Math.max(0, Math.min(255, Number(component)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
      .toUpperCase();
  }

  return normalizeHexColor(fallback);
}

function resolveCssColorValue(
  styles: CSSStyleDeclaration,
  name: string,
  fallback: string,
): string {
  const raw = styles.getPropertyValue(name).trim();
  if (!raw) {
    return fallback;
  }

  if (!raw.startsWith("var(")) {
    return raw;
  }

  const inner = raw.slice(4, -1).split(",")[0]?.trim();
  if (!inner) {
    return fallback;
  }

  return resolveCssColorValue(styles, inner, fallback);
}

function readThemeColors(): DocThemeColors {
  const styles = window.getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) =>
    normalizeHexColor(resolveCssColorValue(styles, name, fallback), fallback);

  return {
    canvas: get("--color-canvas", DEFAULT_THEME.canvas),
    surface: get("--color-surface", DEFAULT_THEME.surface),
    surfaceBorder: get("--color-surface-border", DEFAULT_THEME.surfaceBorder),
    brandPrimary: get("--color-brand-primary", DEFAULT_THEME.brandPrimary),
    textCanvas: get("--color-text-canvas", DEFAULT_THEME.textCanvas),
    textPrimary: get("--color-text-primary", DEFAULT_THEME.textPrimary),
    textInverse: get("--color-text-inverse", DEFAULT_THEME.textInverse),
  };
}

function darkenHexColor(hex: string, factor: number): string {
  const normalized = normalizeHexColor(hex);
  if (normalized.length !== 6) {
    return normalized;
  }

  const clamp = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)));
  const red = clamp(Number.parseInt(normalized.slice(0, 2), 16) * (1 - factor));
  const green = clamp(
    Number.parseInt(normalized.slice(2, 4), 16) * (1 - factor),
  );
  const blue = clamp(
    Number.parseInt(normalized.slice(4, 6), 16) * (1 - factor),
  );

  return [red, green, blue]
    .map((component) => component.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function buildBorder(color: string) {
  return {
    style: BorderStyle.SINGLE,
    color,
    size: 12,
  };
}

function buildTableBorders(color: string) {
  const border = buildBorder(color);
  return {
    top: border,
    bottom: border,
    left: border,
    right: border,
    insideHorizontal: border,
    insideVertical: border,
  };
}

function buildTextParagraph(
  text: string,
  color: string,
  options?: { bold?: boolean; italics?: boolean },
): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, color, ...options })],
  });
}

function buildLabeledParagraph(
  label: string,
  value: string,
  colors: DocThemeColors,
): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${label}: `,
        bold: true,
        color: colors.textPrimary,
      }),
      new TextRun({ text: value, color: colors.textPrimary }),
    ],
  });
}

function buildLinkParagraph(
  label: string,
  url: string,
  colors: DocThemeColors,
): Paragraph {
  return new Paragraph({
    children: [
      new ExternalHyperlink({
        link: url,
        children: [
          new TextRun({
            text: label,
            color: colors.brandPrimary,
            underline: {
              type: UnderlineType.SINGLE,
              color: colors.brandPrimary,
            },
          }),
        ],
      }),
    ],
  });
}

function buildLabelCell(label: string, colors: DocThemeColors): TableCell {
  return new TableCell({
    shading: {
      fill: colors.brandPrimary,
      color: colors.brandPrimary,
      type: ShadingType.CLEAR,
    },
    verticalAlign: VerticalAlignTable.CENTER,
    margins: { top: 120, bottom: 120, left: 120, right: 120 },
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: label, bold: true, color: colors.textInverse }),
        ],
      }),
    ],
  });
}

function buildValueCell(
  children: Paragraph[],
  colors: DocThemeColors,
): TableCell {
  return new TableCell({
    shading: {
      fill: colors.surface,
      color: colors.surface,
      type: ShadingType.CLEAR,
    },
    verticalAlign: VerticalAlignTable.CENTER,
    margins: { top: 120, bottom: 120, left: 120, right: 120 },
    children,
  });
}

function buildTripHeaderSection(
  trip: Trip,
  colors: DocThemeColors,
): Array<Paragraph | Table> {
  const borderColor = darkenHexColor(colors.brandPrimary, 0.45);
  const rows = [
    new TableRow({
      children: [
        buildLabelCell("Destination", colors),
        buildValueCell(
          [buildTextParagraph(trip.destination, colors.textPrimary)],
          colors,
        ),
      ],
    }),
    new TableRow({
      children: [
        buildLabelCell("Dates", colors),
        buildValueCell(
          [
            buildTextParagraph(
              formatDateRange(trip.startDate, trip.endDate),
              colors.textPrimary,
            ),
          ],
          colors,
        ),
      ],
    }),
  ];

  if (trip.description) {
    rows.push(
      new TableRow({
        children: [
          buildLabelCell("Description", colors),
          buildValueCell(
            [buildTextParagraph(trip.description, colors.textPrimary)],
            colors,
          ),
        ],
      }),
    );
  }

  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({
          text: trip.name,
          color: colors.textCanvas,
          bold: true,
          size: 36,
        }),
      ],
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: "Trip overview",
          color: colors.textCanvas,
          bold: true,
        }),
      ],
    }),
    new Table({
      width: { size: "100%", type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      columnWidths: [2300, 8200],
      borders: buildTableBorders(borderColor),
      rows,
    }),
  ];
}

function buildEventDetailsCell(
  event: Event,
  colors: DocThemeColors,
): TableCell {
  const children: Paragraph[] = [];

  if (event.category) {
    children.push(buildLabeledParagraph("Category", event.category, colors));
  }

  if (event.description) {
    children.push(buildLabeledParagraph("Notes", event.description, colors));
  }

  if (children.length === 0) {
    children.push(buildTextParagraph("—", colors.textPrimary));
  }

  return buildValueCell(children, colors);
}

function buildEventLocationCell(
  event: Event,
  colors: DocThemeColors,
): TableCell {
  return buildValueCell(
    [
      buildTextParagraph(event.address, colors.textPrimary),
      buildLinkParagraph("Open in Maps", buildGoogleMapsUrl(event), colors),
    ],
    colors,
  );
}

function buildDayActivityTable(events: Event[], colors: DocThemeColors): Table {
  const borderColor = darkenHexColor(colors.brandPrimary, 0.45);
  const rows = [
    new TableRow({
      children: [
        buildLabelCell("Time", colors),
        buildLabelCell("Activity", colors),
        buildLabelCell("Location", colors),
        buildLabelCell("Details", colors),
      ],
    }),
    ...events.map(
      (event) =>
        new TableRow({
          children: [
            buildValueCell(
              [
                buildTextParagraph(
                  `${format(event.startAt, "p")} – ${format(event.endAt, "p")}`,
                  colors.textPrimary,
                ),
              ],
              colors,
            ),
            buildValueCell(
              [
                buildTextParagraph(event.name, colors.textPrimary, {
                  bold: true,
                }),
              ],
              colors,
            ),
            buildEventLocationCell(event, colors),
            buildEventDetailsCell(event, colors),
          ],
        }),
    ),
  ];

  return new Table({
    width: { size: "100%", type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: [1560, 2600, 3630, 3410],
    borders: buildTableBorders(borderColor),
    rows,
  });
}

function buildDaySection(
  day: Day,
  colors: DocThemeColors,
): Array<Paragraph | Table> {
  const dayLabel = format(day.date, "EEE d MMM");
  const sorted = sortEventsByStart(day.events);
  const children: Array<Paragraph | Table> = [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: `Day ${day.day} — ${dayLabel}`,
          color: colors.textCanvas,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text:
            sorted.length === 0
              ? "No activities planned."
              : `${sorted.length} ${sorted.length === 1 ? "activity" : "activities"}`,
          color: colors.textCanvas,
          italics: true,
        }),
      ],
      spacing: { after: 120 },
    }),
  ];

  if (sorted.length === 0) {
    return children;
  }

  children.push(buildDayActivityTable(sorted, colors));
  return children;
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
    const colors = readThemeColors();
    const days = makeDays(trip.events, trip.startDate, trip.endDate);
    const children: Array<Paragraph | Table> = [
      ...buildTripHeaderSection(trip, colors),
      ...days.flatMap((day) => buildDaySection(day, colors)),
    ];
    const doc = new Document({
      background: { color: colors.canvas },
      sections: [
        {
          properties: {
            page: {
              margin: {
                left: HALF_INCH_TWIPS,
                right: HALF_INCH_TWIPS,
              },
            },
          },
          children,
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    const filename = `${trip.name.replace(/\s+/g, "_")}.docx`;
    downloadBlob(blob, filename);
    toast.success("Itinerary exported!");
  } catch (err) {
    console.error(err);
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
