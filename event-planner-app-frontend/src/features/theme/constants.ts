export const THEMES = [
  { id: "", name: "Default (Orange)" },
  { id: "theme-lavender", name: "Soft Lavender" },
  { id: "theme-ocean", name: "Ocean Blue" },
  { id: "theme-arctic", name: "Arctic Cyan" },
  { id: "theme-emerald", name: "Emerald Forest" },
  { id: "theme-amber", name: "Amber Sunset" },
  { id: "theme-rose", name: "Rose Gold" },
  { id: "theme-bubblegum", name: "Bubblegum Pink" },
  { id: "theme-chocolate-pistachio", name: "Cocoa Pistachio" },
  { id: "theme-timber-dark", name: "Timber" },
  { id: "theme-slate", name: "Professional Slate" },
  { id: "theme-midnight", name: "Midnight Blue" },
  { id: "theme-sandstone", name: "Sandstone" },
  { id: "theme-vaporwave", name: "Vaporwave" },
  { id: "theme-volcanic", name: "Volcanic Dark" },
  { id: "theme-radioactive", name: "Radioactive" },
  { id: "theme-cosmic", name: "Cosmic" },
  { id: "theme-midnight-gold", name: "Midnight Gold" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
