export interface WishlistItem {
  id: number;
  categoryId: number;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  placeId?: string;
  isPromoted: boolean;
  createdBy?: number;
  createdAt?: string;
}

export interface WishlistCategory {
  id: number;
  itineraryId: number;
  name: string;
  items: WishlistItem[];
}

export interface CreateWishlistItemPayload {
  itineraryId: number;
  categoryId: number;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  placeId?: string;
}

export interface CreateCategoryPayload {
  itineraryId: number;
  name: string;
}

export interface DeleteWishlistItemPayload {
  itineraryId: number;
  itemId: number;
}

export interface PromoteWishlistItemPayload {
  itineraryId: number;
  itemId: number;
  startAt: string;
  endAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
