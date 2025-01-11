const fetchAutocomplete = async (input: HTMLInputElement, types?: string[]) => {
  await google.maps.importLibrary("places");
  const autocomplete = new google.maps.places.Autocomplete(input, {
    fields: ["formatted_address", "geometry", "place_id"],
    types: types ?? ["locality"],
  });

  return autocomplete;
};

export { fetchAutocomplete };
