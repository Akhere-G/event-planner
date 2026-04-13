export interface Event {
  name: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  category: string;
  minAge?: number;
  eventStatus: string;
  price: number;
  event_source: string;
  image_url?: string;
  external_id?: string;
  last_sync: string;
}
