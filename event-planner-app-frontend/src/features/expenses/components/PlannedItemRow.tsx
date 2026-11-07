import { Receipt } from "lucide-react";
import type { PlannedItem } from "../planned";
import { formatGbp } from "../utils";

export default function PlannedItemRow({
  item,
  onLog,
}: {
  item: PlannedItem;
  onLog?: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-2 text-sm">
      <span className="min-w-0 truncate text-text-primary">{item.name}</span>
      <span className="flex items-center gap-3 shrink-0 text-text-secondary">
        <span>
          {formatGbp(item.planned)} planned · {formatGbp(item.actual)} spent
        </span>
        {onLog && (
          <button
            type="button"
            className="flex items-center gap-1 text-xs hover:text-brand-primary"
            onClick={onLog}
            aria-label={`Log ${item.name} as expense`}
          >
            <Receipt size={14} />
            Log as expense
          </button>
        )}
      </span>
    </li>
  );
}
