/**
 * Returns a distinct color for a wishlist based on its index.
 * Uses a palette that is visually distinct from the day event colors.
 */
const WISHLIST_COLORS = [
  "#f97316", // Orange (Default)
  "#0ea5e9", // Sky Blue (Accent)
  "#10b981", // Emerald
  "#ef4444", // Red (Volcanic)
  "#7e22ce", // Lavender
  "#d65d0e", // Sandstone
  "#0891b2", // Arctic
  "#ac794a", // Chocolate
  "#8b828b", // Timber
  "#27ad22", // Radioactive
  "#d48f07", // Midnight Gold
];

export const getWishlistColor = (index: number): string => {
  if (index >= 0 && index < WISHLIST_COLORS.length) {
    index = WISHLIST_COLORS.length - index - 1;
    return WISHLIST_COLORS[index];
  }
  // Golden ratio hue spread for extras
  const goldenRatioConjugate = 0.618033988749895;
  const hue = ((index + 5) * goldenRatioConjugate * 360) % 360;
  return `hsl(${hue}, 90%, 45%)`;
};
