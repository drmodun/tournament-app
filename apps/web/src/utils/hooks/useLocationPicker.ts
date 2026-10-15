"use client";

import { PlaceSuggestion } from "api/geocoding/places";
import { useCreateLocation } from "api/client/hooks/locations/useCreateLocation";
import { useState } from "react";

// Turns a place picked in a LocationInput into a stored location and keeps its id for the form payload
export function useLocationPicker() {
  const createLocationMutation = useCreateLocation();
  const [locationId, setLocationId] = useState<number>();

  const selectPlace = async (place: PlaceSuggestion) => {
    const res = await createLocationMutation.mutateAsync({
      lat: place.lat,
      lng: place.lng,
      name: place.label,
      apiId: place.id,
    });

    setLocationId(res.id);
  };

  return { locationId, selectPlace };
}
