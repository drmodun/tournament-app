"use client";

import { PlaceSuggestion, searchPlaces } from "api/geocoding/places";
import Input from "components/input";
import { ComponentProps, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import useDebounce from "utils/hooks/useDebounce";
import styles from "./locationInput.module.scss";

type LocationInputProps = Omit<
  ComponentProps<typeof Input>,
  "controlledValue" | "autocomplete" | "onSelect"
> & {
  // Called with the place the user picked from the suggestions
  onSelect: (place: PlaceSuggestion) => void;
};

// A text input that suggests cities as the user types. Takes the same props as Input.
export default function LocationInput({
  onSelect,
  onChange,
  ...inputProps
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [pickedLabel, setPickedLabel] = useState<string>();
  const formContext = useFormContext();
  // Only the answer to the latest keystroke may update the list
  const latestSearch = useRef(0);

  const search = useDebounce(async (query: string) => {
    const searchId = ++latestSearch.current;

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const places = await searchPlaces(query);
      if (searchId === latestSearch.current) setSuggestions(places);
    } catch {
      // The geocoder being unreachable must not break the form
      if (searchId === latestSearch.current) setSuggestions([]);
    }
  }, 300);

  const pick = (place: PlaceSuggestion) => {
    latestSearch.current++;
    setSuggestions([]);
    setPickedLabel(place.label);

    if (inputProps.isReactFormHook && inputProps.name) {
      formContext?.setValue(inputProps.name, place.label, {
        shouldValidate: true,
      });
    }

    onSelect(place);
  };

  return (
    <div className={styles.wrapper}>
      <Input
        {...inputProps}
        autocomplete="off"
        controlledValue={inputProps.isReactFormHook ? undefined : pickedLabel}
        onChange={(e) => {
          setPickedLabel(undefined);
          search(e.target.value);
          onChange?.(e);
        }}
      />
      {suggestions.length > 0 && (
        <ul className={styles.suggestions}>
          {suggestions.map((place) => (
            <li key={place.id}>
              <button
                type="button"
                className={styles.suggestion}
                onClick={() => pick(place)}
              >
                {place.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
