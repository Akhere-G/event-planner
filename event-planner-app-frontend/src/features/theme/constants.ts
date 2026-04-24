export const THEMES = [
  { id: "", name: "Default (Orange)" },
  { id: "theme-bali-jungle", name: "Bali Jungle" },
  { id: "theme-icelandic-glacier", name: "Icelandic Glacier" },
  { id: "theme-sahara-dusk", name: "Sahara Dusk" },
  { id: "theme-amalfi-coast", name: "Amalfi Coast" },
  { id: "theme-tokyo-neon", name: "Tokyo Neon" },
  { id: "theme-havana-retro", name: "Havana Retro" },
  { id: "theme-london-fog", name: "London Fog" },
  { id: "theme-nyc-taxi", name: "NYC Taxi" },
  { id: "theme-outback", name: "Australian Outback" },
  { id: "theme-kenyan-savanna", name: "Kenyan Savanna" },
  { id: "theme-nigerian-royal", name: "Nigerian Royal" },
  { id: "theme-cape-winelands", name: "Cape Winelands" },
  { id: "theme-egyptian-dune", name: "Egyptian Dune" },
  { id: "theme-seoul-night", name: "Seoul Night" },
  { id: "theme-spanish-fiesta", name: "Spanish Fiesta" },
  { id: "theme-amazonian-rainforest", name: "Amazonian Rainforest" },
  { id: "theme-santorini-azure", name: "Santorini Azure" }, // Greece
  { id: "theme-kyoto-moss", name: "Kyoto Moss" }, // Japan (Traditional)
  { id: "theme-parisian-cafe", name: "Parisian Café" }, // France
  { id: "theme-tulum-cenote", name: "Tulum Cenote" }, // Mexico
  { id: "theme-jaipur-palace", name: "Jaipur Palace" }, // India
  { id: "theme-dubai-lux", name: "Dubai Lux" }, // UAE
  { id: "theme-alpine-frost", name: "Alpine Frost" }, // Switzerland
  { id: "theme-bangkok-market", name: "Bangkok Market" }, // Thailand
  { id: "theme-bohemian-gothic", name: "Bohemian Gothic (Prague)" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
