import {
  Check,
  Copy,
  ExternalLink,
  Plus,
  Star,
  Tag as TagIcon,
} from "lucide-react";
import { Accordion, ConfirmModal, FormInput } from "../../../components";
import type { EventSearchResult, Tag } from "../types";
import type { RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { isFetchBaseQueryError } from "../../api/utils";
import { updateSearchEvents } from "../../maps/service/mapSlice";
import { useParams } from "react-router";
import type { EventSchema } from "../../events/schemas/eventSchema";
import { useAddEventMutation } from "../../events/service/eventApiSlice";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { format } from "date-fns";
import {
  useCreateWishlistItemMutation,
  useGetWishlistsQuery,
} from "../../wishlist/services/wishlistApiSlice";
import type { CreateWishlistItemPayload, Wishlist } from "../../wishlist/types";
import useMenu from "../../../hooks/useMenu";

interface SearchEventCardProps {
  event: EventSearchResult;
  handleSaveEvent: (event: EventSchema) => Promise<void>;
  handleSaveToWishlist: (
    payload: Omit<CreateWishlistItemPayload, "tripId">,
  ) => Promise<void>;
  dates: { title: string; value: string }[];
  isLoading: boolean;
  wishlists: Wishlist[];
}
interface ErrorMessageType {
  endAt: string;
  startAt: string;
  general: string;
}
export function EventSearchResultCard({
  event,
  handleSaveEvent,
  handleSaveToWishlist,
  dates,
  isLoading,
  wishlists,
}: SearchEventCardProps) {
  const {
    placeId,
    address,
    name,
    latitude,
    longitude,
    category,
    tags,
    rating,
    totalReviews,
    photos,
  } = event;
  const { closeMenu, isMenuOpen, openMenu, openButtonRef, menuContainerRef } =
    useMenu();
  const [selectedDate, setSelectedDate] = useState("");
  const [startAt, setStartAt] = useState("12:00");
  const [endAt, setEndAt] = useState("13:00");
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(
    null,
  );
  const [errorMessages, setErrorMessages] = useState<ErrorMessageType>({
    startAt: "",
    endAt: "",
    general: "",
  });

  // TODO: Allow searched events to be added to wishlists

  function onChangeDate(date: string) {
    console.log({ date });
    setSelectedDate(date);
    setSelectedWishlist(null);
  }

  function onChangeWishlist(wishlist: Wishlist) {
    console.log({ wishlist });
    setSelectedWishlist(wishlist);
    setSelectedDate("");
  }

  let confirmText = "Select date or wishlist";

  if (selectedDate) {
    confirmText = `Save to ${new Date(selectedDate).toLocaleDateString()}`;
  } else if (selectedWishlist) {
    confirmText = `Save to ${selectedWishlist?.name}`;
  }

  const isDisabled = (!selectedDate && !selectedWishlist) || isLoading;

  function resetErrorMessages() {
    setErrorMessages({ endAt: "", startAt: "", general: "" });
  }

  function updateErrorMessages(state: Partial<ErrorMessageType>) {
    setErrorMessages((prev) => ({ ...prev, ...state }));
  }

  async function handleSave() {
    resetErrorMessages();
    if (selectedDate) {
      if (endAt < startAt) {
        updateErrorMessages({ endAt: "must be after Start At" });
        return;
      }
      await handleSaveEvent({
        address,
        category,
        latitude,
        longitude,
        name,
        startAt: `${selectedDate} ${startAt}`,
        endAt: `${selectedDate} ${endAt}`,
      });
      toast.success("Added to itinerary.");
      return closeMenu();
    } else if (selectedWishlist) {
      await handleSaveToWishlist({
        address,
        latitude,
        longitude,
        name,
        wishlistId: selectedWishlist.id,
        placeId,
      });
      toast.success("Added to wishlist.");
      return closeMenu();
    }
  }
  return (
    <div className="card border-l-4 border-brand-primary">
      <div className="flex flex-col">
        <header className="truncate font-bold tracking-tight text-text-primary flex flex-col lg:flex-row gap-2 w-full  lg:items-center lg:justify-between">
          <h3 className="text-sm lg:text-md truncate  p-0! m-0!">{name}</h3>
          <div className="text-xs lg:text-sm flex justify-between items-center gap-2">
            <span className="text-warning flex gap-1 items-center">
              <Star fill="var(--color-warning)" size={14} />
              {rating}
              <span className="text-text-secondary">({totalReviews})</span>
            </span>
            <span className="text-xs  flex items-center gap-1 px-2 py-1 rounded-full bg-brand-secondary/10 text-brand-secondary font-semibold uppercase">
              <TagIcon size={16} />
              {category}
            </span>
          </div>
        </header>
        <div className="flex gap-2 items-start">
          <p className="text-sm text-text-secondary h-9 line-clamp-2">
            {address}
          </p>
          <button
            title="Copy Address"
            className="btn p-1 hover:bg-text-primary/10 rounded transition-colors text-text-primary"
            onClick={() => {
              navigator.clipboard.writeText(address);
              toast.info("Copied!");
            }}
          >
            <Copy size={12} />
          </button>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${placeId}`}
            target="_blank"
            rel="noreferrer"
            className="btn p-1 hover:bg-brand-primary/10 rounded transition-colors text-brand-primary"
            title="Open in Google Maps"
          >
            <ExternalLink size={12} />
          </a>
        </div>
        {tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {tags.map((tag) => (
              <TagChip key={tag.text} {...tag} />
            ))}
          </div>
        )}

        <div className="relative">
          <Accordion
            TitleComponent={({ isOpen }) => (
              <p className="text-xs text-text-secondary">
                {isOpen ? "Show Less" : "Show More"}
              </p>
            )}
            headerStyles="p-0! pt-2!"
            contentStyles="p-0 pb-2!"
            ContentComponent={() => <Images photos={photos} name={name} />}
          />
        </div>
        {isMenuOpen && (
          <ConfirmModal
            closeModal={closeMenu}
            confirmAction={handleSave}
            title={`Save ${name}`}
            modalRef={menuContainerRef}
            confirmBtnClasses="btn-primary flex-1"
            confirmText={confirmText}
            confirmButtonProps={{ disabled: isDisabled }}
          >
            <div className="p-4">
              <h4 className="mb-4">Save to date</h4>
              <div className="flex flex-wrap gap-2">
                {dates.map((date) => (
                  <button
                    className={`border-2 border-brand-primary text-brand-primary font-bold px-6 py-2 flex-1/4
                      hover:bg-brand-primary hover:text-text-primary ${date.value === selectedDate ? "bg-brand-primary text-text-primary" : ""}`}
                    key={date.value}
                    onClick={() => onChangeDate(date.value)}
                  >
                    {date.title}
                  </button>
                ))}
              </div>
              <div className="flex mt-4 gap-2">
                <FormInput
                  type="time"
                  name="selectedStartAt"
                  label="Start At"
                  formClassNames="flex-1"
                  onChange={(e) => setStartAt(e.target.value)}
                  value={startAt}
                  errorMessage={errorMessages.startAt}
                />
                <FormInput
                  type="time"
                  name="selectedEndAt"
                  label="End At"
                  formClassNames="flex-1"
                  onChange={(e) => setEndAt(e.target.value)}
                  value={endAt}
                  errorMessage={errorMessages.endAt}
                />
              </div>
              <hr className="my-6" />
              <h4 className="mb-4">Save to wishlist</h4>
              <div className="flex flex-wrap gap-2">
                {wishlists.map((wishlist) => (
                  <button
                    className={`border-2 border-brand-primary text-brand-primary font-bold px-6 py-2
                      hover:bg-brand-primary hover:text-text-primary ${wishlist === selectedWishlist ? "bg-brand-primary text-text-primary" : ""}`}
                    key={wishlist.id}
                    onClick={() => onChangeWishlist(wishlist)}
                  >
                    {wishlist.name}
                  </button>
                ))}
              </div>
              {errorMessages.general && <p>{errorMessages.general}</p>}
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
            <>
              <button
                className="flex gap-2 items-center bg-brand-primary"
                ref={openButtonRef}
                onClick={openMenu}
              >
                <Plus size={16} />
                Add
              </button>
              {/* <EditableSelect
              options={dates}
              isLoading={isLoading}
              canEdit
              setValue={(date) =>
                handleSave({
                  address,
                  category,
                  latitude,
                  longitude,
                  name,
                  startAt: `${date} 12:00`,
                  endAt: `${date} 13:00`,
                })
              }
              selectClassName={`top-auto bottom-0 right-0 left-auto grid grid-cols-4 w-40`}
              selectedValue=""
              showEditIcon={false}
              defaultElement={
                <div
                  tabIndex={0}
                  role="button"
                  className="group btn-secondary px-3 py-1 rounded-md flex gap-2 items-center w-min"
                >
                  <Plus size={16} aria-hidden />
                  Add
                </div>
              }
            />*/}
            </>
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
  const { data } = useGetWishlistsQuery(Number(tripId));

  const wishlists = data?.data ?? [];

  const dispatch = useDispatch();

  const [addEvent, { isLoading: isAddEventLoading }] = useAddEventMutation();
  const [createWishlist, { isLoading: isCreateWishlistLoading }] =
    useCreateWishlistItemMutation();
  const currentEvent = searchEvents[searchIndex];

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

  const handleSaveToWishlist = async (
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

  const dates = days.map((day) => ({
    title: format(day.date, "dd MMM"),
    value: day.date,
  }));

  return (
    <EventSearchResultCard
      event={currentEvent}
      dates={dates}
      handleSaveEvent={handleSaveEvent}
      handleSaveToWishlist={handleSaveToWishlist}
      isLoading={isAddEventLoading || isCreateWishlistLoading}
      wishlists={wishlists}
    />
  );
}

export function TagChip({ color, text }: Tag) {
  return (
    <div
      style={{ backgroundColor: color }}
      className="rounded-full text-text-inverse font-bold px-3 py-0.5 text-xs"
    >
      {text}
    </div>
  );
}

function Images({ name, photos }: { name: string; photos: { url: string }[] }) {
  const [currentIndex, setCurrentIndex] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMultiple = photos.length > 1;

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, offsetWidth } = scrollRef.current;
      const offsetVariance = 1.15;
      const newIndex =
        Math.round((scrollLeft * offsetVariance) / offsetWidth) + 1;
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }
  };

  return (
    <div className="relative group">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`
          flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory 
          ${isMultiple ? "scrollbar-visible" : "scrollbar-hide"}
        `}
      >
        {photos.map((photo, index) => (
          <div
            key={index}
            className={`
              h-60 shrink-0 snap-center
              ${isMultiple ? "w-[85%]" : "w-full"} 
            `}
          >
            <img
              className="rounded-md w-full h-full object-cover shadow-sm"
              src={photo.url}
              alt={name}
            />
          </div>
        ))}
      </div>

      {isMultiple && (
        <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full font-bold ">
          {currentIndex} / {photos.length}
        </div>
      )}
    </div>
  );
}
