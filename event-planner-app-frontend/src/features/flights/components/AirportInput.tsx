import { useState } from "react";
import FormField from "../../../components/FormField";
import { Input } from "../../../components/ui/input";
import useDebouncedValue from "../../../hooks/useDebouncedValue";
import { useSearchAirportsQuery } from "../flightApiSlice";
import type { AirportPlace } from "../types";

interface AirportInputProps {
  tripId: number;
  name: string;
  label: string;
  selectedLabel: string | null;
  onSelect: (place: AirportPlace) => void;
  onClear: () => void;
  errorMessage?: string;
  placeholder?: string;
  bias?: { lat: number; lng: number };
}

const MIN_QUERY_LENGTH = 2;

export default function AirportInput({
  tripId,
  name,
  label,
  selectedLabel,
  onSelect,
  onClear,
  errorMessage,
  placeholder = "City or airport",
  bias,
}: AirportInputProps) {
  const [text, setText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const query = useDebouncedValue(text.trim());
  const { data, isFetching } = useSearchAirportsQuery(
    { tripId, q: query, lat: bias?.lat, lng: bias?.lng },
    { skip: !isEditing || query.length < MIN_QUERY_LENGTH },
  );
  const places = data?.data ?? [];
  const showResults = isOpen && isEditing && query.length >= MIN_QUERY_LENGTH;

  const handleChange = (value: string) => {
    setText(value);
    setIsEditing(true);
    setIsOpen(true);
    if (selectedLabel) onClear();
  };

  const handleSelect = (place: AirportPlace) => {
    setIsEditing(false);
    setIsOpen(false);
    onSelect(place);
  };

  return (
    <FormField label={label} name={name} errorMessage={errorMessage}>
      <Input
        id={name}
        name={name}
        autoComplete="off"
        role="combobox"
        aria-expanded={showResults}
        aria-controls={`${name}-options`}
        placeholder={placeholder}
        className={errorMessage ? "border-error" : ""}
        value={!isEditing && selectedLabel ? selectedLabel : text}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      />
      {showResults && (
        <ul
          id={`${name}-options`}
          role="listbox"
          className="absolute top-full left-0 right-0 z-20 mt-1 max-h-60 overflow-auto rounded-md border border-surface-border bg-surface shadow-lg"
        >
          {places.length === 0 && (
            <li className="px-3 py-2 text-sm text-text-secondary">
              {isFetching ? "Searching..." : "No airports found"}
            </li>
          )}
          {places.map((place) => (
            <li key={place.label} role="option" aria-selected={false}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-surface-muted"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(place)}
              >
                <span className="block text-sm text-text-main">
                  {place.label}
                </span>
                <span className="block text-xs text-text-secondary">
                  {place.airports.map((airport) => airport.code).join(", ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </FormField>
  );
}
