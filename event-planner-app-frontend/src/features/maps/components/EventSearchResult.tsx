import { Check, Plus } from "lucide-react";
import { Accordion, ConfirmModal } from "../../../components";
import type { EventSearchResult } from "../types";
import type { RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { isFetchBaseQueryError } from "../../api/utils";
import { updateSearchEvents } from "../../maps/service/mapSlice";
import { useParams } from "react-router";
import type { EventSchema } from "../../events/schemas/eventSchema";
import { useAddEventMutation } from "../../events/service/eventApiSlice";
import { toast } from "sonner";
import { useState } from "react";
import { format } from "date-fns";
import {
  useCreateWishlistItemMutation,
  useGetWishlistsQuery,
} from "../../wishlist/services/wishlistApiSlice";
import type { CreateWishlistItemPayload, Wishlist } from "../../wishlist/types";
import AccommodationForm from "../../accommodations/components/AccommodationForm";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";
import { getCityBounds } from "../../maps/utils";

import { PlaceHeader } from "./PlaceHeader";
import { PlaceAddress } from "./PlaceAddress";
import { TagChip } from "./TagChip";
import { SaveEventModal } from "./SaveEventModal";
import { ImageCarousel } from "./ImageCarousel";

interface EventSearchResultCardProps {
  event: EventSearchResult;
  dates: { title: string; value: string }[];
  wishlists: Wishlist[];
  tripId: number;
  tripStart: string;
  tripEnd: string;
  cityBounds: { north: number; south: number; east: number; west: number };
  isLoading: boolean;
  onSaveEvent: (event: EventSchema) => Promise<void>;
  onSaveWishlist: (
    payload: Omit<CreateWishlistItemPayload, "tripId">,
  ) => Promise<void>;
  onAccommodationSaved: () => void;
}

export function EventSearchResultCard({
  event,
  dates,
  wishlists,
  tripId,
  tripStart,
  tripEnd,
  cityBounds,
  isLoading,
  onSaveEvent,
  onSaveWishlist,
  onAccommodationSaved,
}: EventSearchResultCardProps) {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isAccommodationOpen, setIsAccommodationOpen] = useState(false);
  const isAccommodation = event.types.includes("lodging");

  const handleAdd = () => {
    if (isAccommodation) {
      setIsAccommodationOpen(true);
    } else {
      setIsSaveModalOpen(true);
    }
  };

  return (
    <div className="card border-l-4 border-brand-primary">
      <div className="flex flex-col gap-3">
        <PlaceHeader
          name={event.name}
          rating={event.rating}
          totalReviews={event.totalReviews}
          category={event.category}
        />

        <PlaceAddress
          name={event.name}
          address={event.address}
          placeId={event.placeId}
        />

        {event.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {event.tags.map((tag) => (
              <TagChip key={tag.text} {...tag} />
            ))}
          </div>
        )}

        {event.photos.length > 0 && (
          <Accordion
            TitleComponent={() => (
              <p className="text-xs text-text-secondary">
                Show More
              </p>
            )}
            headerStyles="p-0! pt-2!"
            contentStyles="p-0 pb-2!"
            ContentComponent={() => (
              <ImageCarousel photos={event.photos} name={event.name} />
            )}
          />
        )}

        <SaveEventModal
          open={isSaveModalOpen}
          event={event}
          dates={dates}
          wishlists={wishlists}
          isLoading={isLoading}
          onOpenChange={setIsSaveModalOpen}
          onSaveEvent={onSaveEvent}
          onSaveWishlist={onSaveWishlist}
        />

        {isAccommodationOpen && (
          <ConfirmModal
            open={isAccommodationOpen}
            onOpenChange={setIsAccommodationOpen}
            title="Add Accommodation from Search"
            hideButtons
          >
            <div className="p-4">
              <AccommodationForm
                tripId={tripId}
                cityBounds={cityBounds}
                selectedAccommodation={{
                  name: event.name,
                  address: event.address,
                  latitude: event.latitude,
                  longitude: event.longitude,
                }}
                tripStart={tripStart}
                tripEnd={tripEnd}
                onSuccess={() => {
                  setIsAccommodationOpen(false);
                  onAccommodationSaved();
                }}
                onCancel={() => setIsAccommodationOpen(false)}
              />
            </div>
          </ConfirmModal>
        )}

        <div className="flex justify-end">
          {event.isAdded ? (
            <span className="text-xs flex gap-2 bg-brand-primary px-3 py-1 rounded-full">
              <Check size={16} />
              Added
            </span>
          ) : (
            <button
              onClick={handleAdd}
              className="flex gap-2 items-center bg-brand-primary"
            >
              <Plus size={16} />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EventSearchResultCardConnected() {
  const { tripId } = useParams();
  const { searchEvents, searchIndex, days } = useSelector(
    (state: RootState) => state.map,
  );
  const { data: wishlists } = useGetWishlistsQuery(Number(tripId));
  const { data: tripData } = useGetTripQuery(Number(tripId));

  const dispatch = useDispatch();
  const [addEvent, { isLoading: isAddEventLoading }] = useAddEventMutation();
  const [createWishlist, { isLoading: isCreateWishlistLoading }] =
    useCreateWishlistItemMutation();

  const currentEvent = searchEvents[searchIndex];
  const trip = tripData?.data;

  const updateSearchResults = () => {
    dispatch(
      updateSearchEvents((e) =>
        e.placeId === currentEvent.placeId ? { ...e, isAdded: true } : e,
      ),
    );
  };

  const handleSaveEvent = async (event: EventSchema) => {
    try {
      await addEvent({ tripId: Number(tripId), event }).unwrap();
      updateSearchResults();
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        toast.error((err.data as { message: string }).message);
      }
    }
  };

  const handleSaveWishlist = async (
    payload: Omit<CreateWishlistItemPayload, "tripId">,
  ) => {
    try {
      await createWishlist({ ...payload, tripId: Number(tripId) }).unwrap();
      updateSearchResults();
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        toast.error((err.data as { message: string }).message);
      }
    }
  };

  if (!currentEvent || !trip) return null;

  const dates = days.map((day) => ({
    title: format(day.date, "dd MMM"),
    value: day.date,
  }));

  return (
    <EventSearchResultCard
      event={currentEvent}
      dates={dates}
      wishlists={wishlists?.data ?? []}
      tripId={Number(tripId)}
      tripStart={trip.startDate}
      tripEnd={trip.endDate}
      cityBounds={getCityBounds(trip)}
      isLoading={isAddEventLoading || isCreateWishlistLoading}
      onSaveEvent={handleSaveEvent}
      onSaveWishlist={handleSaveWishlist}
      onAccommodationSaved={updateSearchResults}
    />
  );
}
