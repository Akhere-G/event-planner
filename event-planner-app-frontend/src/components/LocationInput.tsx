import React, { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import StateGate from "./StateGate";

interface LocationInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
  classNames?: string;
  inputClassNames?: string;
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  searchTypes?: string[];
  cityBounds?: { north: number; east: number; south: number; west: number };
  onPlaceQuery?: (query: string) => void;
}

export default function LocationInput({
  label,
  errorMessage,
  classNames = "",
  inputClassNames = "",
  onPlaceSelect,
  cityBounds,
  onPlaceQuery,
  searchTypes = ["establishment"],
  ...rest
}: LocationInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const placesLibrary = useMapsLibrary("places");

  useEffect(() => {
    if (!placesLibrary || !inputRef.current) return;

    const options: google.maps.places.AutocompleteOptions = {
      fields: ["formatted_address", "geometry", "name"],
      types: searchTypes,
    };

    if (cityBounds) {
      options.bounds = cityBounds;
      options.strictBounds = false;
    }

    const instance = new placesLibrary.Autocomplete(inputRef.current, options);

    setAutocomplete(instance);
  }, [placesLibrary, searchTypes, cityBounds]);

  useEffect(() => {
    if (!autocomplete) return;

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;
      onPlaceSelect(place);
    });

    return () => google.maps.event.removeListener(listener);
  }, [autocomplete, onPlaceSelect]);

  return (
    <div className={`relative ${classNames}`}>
      <StateGate
        loadingStateProps={{ isLoading: !placesLibrary, message: "Loading..." }}
      >
        <div className="flex flex-col">
          {label && (
            <label className="text-xs text-text-secondary pb-1">{label}</label>
          )}

          <input
            {...rest}
            ref={inputRef}
            type="text"
            className={`form-input w-full ${inputClassNames}`}
            placeholder="Search for a location..."
            onKeyDown={(e) => {
              if (e.key == "Enter" && inputRef.current && onPlaceQuery) {
                onPlaceQuery(inputRef.current?.value);
              }
            }}
          />

          {errorMessage && (
            <span className="absolute text-xs -bottom-5 right-1 text-error">
              {errorMessage}
            </span>
          )}
        </div>
      </StateGate>
    </div>
  );
}
