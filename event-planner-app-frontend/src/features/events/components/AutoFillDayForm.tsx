import React, { useState } from "react";
import {
  Compass,
  Smile,
  Users,
  Baby,
  Footprints,
  Train,
  Car,
  Bike,
  Wine,
  Milestone,
  Sparkles,
  Palmtree,
  Utensils,
  ShoppingBag,
  Zap,
  Palette,
  Trees,
  Flower2,
  Castle,
  Mountain,
} from "lucide-react";
import { ToggleButton } from "../../../components";
import type { AutofillConfig } from "../types";

interface ToggleOption {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PACE_OPTIONS: ToggleOption[] = [
  { label: "Relaxed", value: "relaxed", icon: Compass },
  { label: "Balanced", value: "balanced", icon: Smile },
  { label: "Packed", value: "packed", icon: Zap },
];

const COMPANION_OPTIONS: ToggleOption[] = [
  { label: "Solo", value: "solo", icon: Footprints },
  { label: "Couple", value: "couple", icon: Users },
  { label: "Friends", value: "friends", icon: Palmtree },
  { label: "Family", value: "family_with_kids", icon: Baby },
];

const TRANSPORT_OPTIONS: ToggleOption[] = [
  { label: "Walking", value: "walking", icon: Footprints },
  { label: "Transit", value: "public_transport", icon: Train },
  { label: "Driving", value: "driving", icon: Car },
  { label: "Cycling", value: "cycling", icon: Bike },
];

const INTEREST_OPTIONS: ToggleOption[] = [
  { label: "Museums", value: "museums", icon: Milestone },
  { label: "Sightseeing", value: "sightseeing", icon: Compass },
  { label: "Bars & Clubs", value: "bars_and_clubs", icon: Wine },
  { label: "Food", value: "food", icon: Utensils },
  { label: "Shopping", value: "shopping", icon: ShoppingBag },
  { label: "Art & Galleries", value: "art_and_galleries", icon: Palette },
  { label: "Nature & Wildlife", value: "nature_and_wildlife", icon: Trees },
  { label: "Wellness & Spas", value: "wellness_and_spas", icon: Flower2 },
  { label: "Historical Sites", value: "historical_sites", icon: Castle },
  {
    label: "Sports & Adventure",
    value: "sports_and_adventure",
    icon: Mountain,
  },
  { label: "Hidden Gems", value: "hidden_gems", icon: Sparkles },
];

export default function AutofillDayForm({
  onSubmit,
}: {
  onSubmit: (data: AutofillConfig) => void;
}) {
  const [pace, setPace] = useState<string>("balanced");
  const [companions, setCompanions] = useState<string>("couple");
  const [transport, setTransport] = useState<string>("public_transport");
  const [interests, setInterests] = useState<string[]>([]);

  const handleToggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ pace, companions, transport, interests });
  };

  return (
    <form id="autofill-itinerary-form" onSubmit={handleSubmit} className="form">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-text-primary">
          Preferred Travel Pace
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PACE_OPTIONS.map((option) => (
            <ToggleButton
              key={option.value}
              label={option.label}
              value={option.value}
              isSelected={pace === option.value}
              onClick={setPace}
              icon={option.icon}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <label className="text-sm font-semibold text-text-primary">
          Who are you traveling with?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COMPANION_OPTIONS.map((option) => (
            <ToggleButton
              key={option.value}
              label={option.label}
              value={option.value}
              isSelected={companions === option.value}
              onClick={setCompanions}
              icon={option.icon}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <label className="text-sm font-semibold text-text-primary">
          Getting Around
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TRANSPORT_OPTIONS.map((option) => (
            <ToggleButton
              key={option.value}
              label={option.label}
              value={option.value}
              isSelected={transport === option.value}
              onClick={setTransport}
              icon={option.icon}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <label className="text-sm font-semibold text-text-primary">
          Main Focus Areas{" "}
          <span className="text-xs font-normal text-text-secondary">
            (Select multiple)
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {INTEREST_OPTIONS.map((option) => (
            <ToggleButton
              key={option.value}
              label={option.label}
              value={option.value}
              isSelected={interests.includes(option.value)}
              onClick={handleToggleInterest}
              icon={option.icon}
            />
          ))}
        </div>
      </div>
    </form>
  );
}
