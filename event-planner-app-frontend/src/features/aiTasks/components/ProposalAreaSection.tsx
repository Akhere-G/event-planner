import {
  BedDouble,
  Calendar,
  ChevronDown,
  Heart,
  Luggage,
  type LucideIcon,
} from "lucide-react";
import { ChangePreviewList } from "../../ai/components";
import type { ChangeStaleness } from "../../ai/components/ChangePreviewList";
import type { ChangeEntity } from "../../ai/types";
import type { IndexedChangeOp } from "../../ai/utils";
import type { Event } from "../../events/types";

const AREAS: Record<
  ChangeEntity,
  { title: string; subtitle: string; Icon: LucideIcon }
> = {
  event: {
    title: "Events",
    subtitle: "Schedule, times and places",
    Icon: Calendar,
  },
  packing_item: {
    title: "Packing",
    subtitle: "Items and quantities",
    Icon: Luggage,
  },
  accommodation: {
    title: "Accommodation",
    subtitle: "Stays and room details",
    Icon: BedDouble,
  },
  wishlist_item: {
    title: "Wishlist",
    subtitle: "Saved ideas and places",
    Icon: Heart,
  },
};

interface ProposalAreaSectionProps {
  entity: ChangeEntity;
  items: IndexedChangeOp[];
  events: Event[];
  timezone: string;
  selected: ReadonlySet<number>;
  staleness: ReadonlyMap<number, ChangeStaleness>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: (index: number) => void;
  /** Selects or clears every applicable suggestion in this area. */
  onSelectAll: (indexes: number[], select: boolean) => void;
}

/** One collapsible area of a proposal with its own selection shortcut. */
export default function ProposalAreaSection({
  entity,
  items,
  events,
  timezone,
  selected,
  staleness,
  isOpen,
  onOpenChange,
  onToggle,
  onSelectAll,
}: ProposalAreaSectionProps) {
  const { title, subtitle, Icon } = AREAS[entity];
  const applicable = items
    .filter((item) => staleness.get(item.index) !== "deleted")
    .map((item) => item.index);
  const selectedCount = applicable.filter((index) =>
    selected.has(index),
  ).length;
  const allSelected =
    applicable.length > 0 && selectedCount === applicable.length;

  return (
    <section className="overflow-hidden rounded-2xl border border-surface-border bg-surface">
      <div className="flex items-center gap-2 pr-4">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={`${title}, ${selectedCount} of ${applicable.length} selected`}
          onClick={() => onOpenChange(!isOpen)}
          className="flex min-w-0 flex-1 items-center gap-3 p-4 text-left"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
            <Icon size={20} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="font-semibold text-text-primary">{title}</span>
            <span className="truncate text-sm text-text-secondary">
              {subtitle}
            </span>
          </span>
          <span className="shrink-0 text-xs font-semibold text-text-secondary">
            {selectedCount}/{applicable.length} selected
          </span>
          <ChevronDown
            size={18}
            className={`shrink-0 text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        {applicable.length > 0 && (
          <button
            type="button"
            className="shrink-0 text-sm font-semibold text-brand-primary"
            onClick={() => onSelectAll(applicable, !allSelected)}
          >
            {allSelected ? "Clear" : "Select all"}
          </button>
        )}
      </div>
      {isOpen && (
        <div className="border-t border-surface-border bg-surface-muted/50 p-3 max-h-100 overflow-y-scroll">
          <ChangePreviewList
            items={items}
            events={events}
            timezone={timezone}
            selected={selected}
            staleness={staleness}
            onToggle={onToggle}
          />
        </div>
      )}
    </section>
  );
}
