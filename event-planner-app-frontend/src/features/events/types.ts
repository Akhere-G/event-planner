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

export type Day = {
  date: string;
  events: Event[];
  day: number;
  show: boolean;
};

export interface AutofillConfig {
  pace: string;
  companions: string;
  transport: string;
  interests: string[];
}
