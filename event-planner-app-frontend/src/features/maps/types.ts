export interface PlacePhoto {
  height: number;
  width: number;
  url: string;
}

export interface Tag {
  text: string;
  color: string;
}
export interface EventSearchResult {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isAdded: boolean;
  tags: Tag[];
  rating: number;
  category: string;
  totalReviews: number;
  photos: PlacePhoto[];
}
export interface Point {
  latitude: number;
  longitude: number;
  name: string;
}

export interface Route {
  from: Point;
  to: Point;
  mode: string;
}

export interface CityBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
