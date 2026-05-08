import {
  Utensils,
  Gem,
  Pill,
  Banknote,
  Accessibility,
  Camera,
  ShoppingBag,
  Music,
  Trees,
  ShoppingCart,
  WashingMachine,
  Wine,
  Music4,
} from "lucide-react";

export const DEFAULT_PADDING = 1;
export const MAX_ZOOM = 17;
export const MIN_ZOOM = 10;
export const DEFAULT_ZOOM = 12;
export const CITY_RADIUS = 0.06;

export const searchTags = [
  {
    label: "Restaurants",
    query: "restaurants",
    Icon: Utensils,
  },
  {
    label: "Things to do",
    query: "things to do",
    Icon: Gem,
  },
  {
    label: "Bars",
    query: "bars",
    Icon: Wine,
  },
  {
    label: "Clubs",
    query: "clubs",
    Icon: Music4,
  },

  {
    label: "Restrooms",
    query: "public toilets",
    Icon: Accessibility,
  },
  {
    label: "ATM",
    query: "atm",
    Icon: Banknote,
  },
  {
    label: "Pharmacy",
    query: "pharmacy open now",
    Icon: Pill,
  },
  {
    label: "Viewpoints",
    query: "scenic viewpoint",
    Icon: Camera,
  },
  {
    label: "Markets",
    query: "street food market",
    Icon: ShoppingBag,
  },
  {
    label: "Live Music",
    query: "bar with live music",
    Icon: Music,
  },
  {
    label: "Parks",
    query: "park",
    Icon: Trees,
  },
  {
    label: "Groceries",
    query: "convenience store",
    Icon: ShoppingCart,
  },
  {
    label: "Laundry",
    query: "self service laundry",
    Icon: WashingMachine,
  },
];

export const TravelModes = [
  {
    title: "Walking",
    value: "WALKING",
  },
  {
    title: "Driving",
    value: "DRIVING",
  },
  {
    title: "Transit",
    value: "TRANSIT",
  },
];
