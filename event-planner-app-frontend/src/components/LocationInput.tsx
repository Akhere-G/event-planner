import React, { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import StateGate from "./StateGate";

interface LocationInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
  classNames?: string;
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  searchTypes?: string[];
}

export default function LocationInput({
  label,
  errorMessage,
  classNames = "",
  onPlaceSelect,
  searchTypes = ["establishment"],
  ...rest
}: LocationInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const placesLibrary = useMapsLibrary("places");

  useEffect(() => {
    if (!placesLibrary || !inputRef.current) return;

    const instance = new placesLibrary.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "geometry", "name"],
      types: searchTypes,
    });

    setAutocomplete(instance);
  }, [placesLibrary, searchTypes]);

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
            className="form-input w-full"
            placeholder="Search for a location..."
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
