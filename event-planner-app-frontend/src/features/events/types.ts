export interface Event {
  id: number;
  description?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  startAt: string;
  endAt: string;
  category: string;
}

export interface EventSearchResult {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isAdded: boolean;
}

export type Day = {
  date: string;
  events: Event[];
  day: number;
  show: boolean;
};
