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

export interface Wishlist {
  id: number;
  tripId: number;
  name: string;
  items: WishlistItem[];
}

export interface CreateWishlistItemPayload {
  tripId: number;
  wishlistId: number;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  placeId?: string;
}

export interface CreateWishlistPayload {
  tripId: number;
  name: string;
}

export interface UpdateWishlistPayload {
  name: string;
  wishlistId: number;
  tripId: number;
}
export interface DeleteWishlistItemPayload {
  tripId: number;
  wishlistId: number;
  itemId: number;
}

export interface PromoteWishlistItemPayload {
  tripId: number;
  wishlistId: number;
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

export interface NewItemInput {
  name: string;
  address?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}
