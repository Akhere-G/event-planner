export interface TemplateSummary {
  slug: string;
  title: string;
  destination: string;
  latitude: number;
  longitude: number;
  durationDays: number;
  description: string | null;
  authorName: string | null;
  cloneCount: number;
  createdAt: string;
  eventCount: number;
  placeCount: number;
}

export interface TemplateEvent {
  name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  dayOffset: number;
  startTime: string;
  endDayOffset: number;
  endTime: string;
}

export interface TemplateAccommodation {
  name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  startDayOffset: number;
  endDayOffset: number;
}

export interface TemplatePackingItem {
  name: string;
  category: string;
}

export interface TemplateWishlistItem {
  name: string;
  wishlistName: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
}

export interface TemplateDay {
  dayOffset: number;
  events: TemplateEvent[];
}

export interface TemplateDetail extends TemplateSummary {
  timezone: string | null;
  days: TemplateDay[];
  accommodations: TemplateAccommodation[];
  packingItems: TemplatePackingItem[];
  wishlistItems: TemplateWishlistItem[];
}

export interface TemplateList {
  templates: TemplateSummary[];
  total: number;
  hasMore: boolean;
}

export interface PublishStatus {
  isPublished: boolean;
  slug: string | null;
  title?: string;
  cloneCount?: number;
}

export interface ClonedTrip {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}
