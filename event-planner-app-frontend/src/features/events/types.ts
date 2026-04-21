export interface Event {
  id: number;
  description: string;
  name: string;
  address: string;
  longitude: number;
  latitude: number;
  startAt: string;
  endAt: string;
  category: string;
}

export const eventCategories = [
  { title: "Dining", value: "dining" },
  { title: "Sightseeing", value: "sightseeing" },
  { title: "Shopping", value: "shopping" },
  { title: "Markets", value: "markets" },
  { title: "Culture", value: "culture" },
  { title: "Entertainment", value: "entertainment" },
  { title: "Workshops", value: "workshops" },
  { title: "Adventure", value: "adventure" },
  { title: "Wellness", value: "wellness" },
  { title: "Leisure", value: "leisure" },
  { title: "Transport", value: "transport" },
  { title: "Admin", value: "admin" },
  { title: "General", value: "general" },
];
