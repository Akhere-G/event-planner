/**
 * Returns a distinct color for a wishlist based on its index.
 * Uses a palette that is visually distinct from the day event colors.
 */
const WISHLIST_COLORS = [
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f59e0b", // Amber
  "#6366f1", // Indigo
  "#22c55e", // Green
  "#e11d48", // Rose
  "#06b6d4", // Cyan
  "#a855f7", // Purple
  "#84cc16", // Lime
  "#f97316", // Orange
];

export const getWishlistColor = (index: number): string => {
  if (index >= 0 && index < WISHLIST_COLORS.length) {
    return WISHLIST_COLORS[index];
  }
  // Golden ratio hue spread for extras
  const goldenRatioConjugate = 0.618033988749895;
  const hue = ((index + 5) * goldenRatioConjugate * 360) % 360;
  return `hsl(${hue}, 90%, 45%)`;
};
