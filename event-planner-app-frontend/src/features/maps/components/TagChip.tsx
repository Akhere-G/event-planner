import type { Tag } from "../types";

export function TagChip({ color, text }: Tag) {
  return (
    <div
      style={{ backgroundColor: color }}
      className="rounded-full text-text-inverse font-bold px-3 py-0.5 text-xs"
    >
      {text}
    </div>
  );
}
