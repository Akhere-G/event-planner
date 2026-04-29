import {
  Utensils,
  Gem,
  Pill,
  Banknote,
  Accessibility,
  Coffee,
  Camera,
  ShoppingBag,
  Music,
  Trees,
  ShoppingCart,
  WashingMachine,
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
    category: "food",
  },
  {
    label: "Things to do",
    query: "things to do",
    Icon: Gem,
    category: "food",
  },
  {
    label: "Pharmacy",
    query: "pharmacy open now",
    Icon: Pill,
    category: "essentials",
  },
  {
    label: "ATM",
    query: "atm",
    Icon: Banknote,
    category: "essentials",
  },
  {
    label: "Restrooms",
    query: "public toilets",
    Icon: Accessibility,
    category: "essentials",
  },
  {
    label: "Coffee",
    query: "specialty coffee",
    Icon: Coffee,
    category: "essentials",
  },
  {
    label: "Viewpoints",
    query: "scenic viewpoint",
    Icon: Camera,
    category: "sightseeing",
  },
  {
    label: "Markets",
    query: "street food market",
    Icon: ShoppingBag,
    category: "sightseeing",
  },
  {
    label: "Live Music",
    query: "bar with live music",
    Icon: Music,
    category: "sightseeing",
  },
  {
    label: "Parks",
    query: "park",
    Icon: Trees,
    category: "sightseeing",
  },
  {
    label: "Groceries",
    query: "convenience store",
    Icon: ShoppingCart,
    category: "logistics",
  },
  {
    label: "Laundry",
    query: "self service laundry",
    Icon: WashingMachine,
    category: "logistics",
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
