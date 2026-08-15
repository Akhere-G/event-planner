import React, { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Input } from "./ui/input";
import { FormField, type FormFieldProps } from "./FormField";

interface LocationInputProps extends Omit<FormFieldProps, "children"> {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  searchTypes?: string[];
  cityBounds?: { north: number; east: number; south: number; west: number };
  onPlaceQuery?: (query: string) => void;
  initialValue?: string;
}

export default function LocationInput({
  label,
  errorMessage,
  formClassNames = "",
  onPlaceSelect,
  cityBounds,
  onPlaceQuery,
  initialValue,
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
      fields: ["formatted_address", "geometry", "name", "types"],
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
    if (inputRef.current && initialValue) {
      inputRef.current.value = initialValue;
    }
  }, [initialValue]);

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
    <FormField
      label={label}
      name="location"
      touched={true}
      errorMessage={errorMessage}
      formClassNames={formClassNames}
    >
      <Input
        {...rest}
        ref={inputRef}
        type="text"
        placeholder="Search for a location..."
        onKeyDown={(e) => {
          if (e.key == "Enter" && inputRef.current && onPlaceQuery) {
            onPlaceQuery(inputRef.current?.value);
          }
        }}
      />
    </FormField>
  );
}
