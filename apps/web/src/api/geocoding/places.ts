// Place search on OpenStreetMap data through a Photon server (https://photon.komoot.io by default,
// self-hostable: https://github.com/komoot/photon). No API key involved.
const GEOCODER_URL =
  process.env.NEXT_PUBLIC_GEOCODER_URL || "https://photon.komoot.io";

export interface PlaceSuggestion {
  // OpenStreetMap identifier, e.g. "R226224"; stored as the location's apiId
  id: string;
  // Full display text, e.g. "Zagreb, Croatia"
  label: string;
  lat: number;
  lng: number;
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    osm_type: string;
    osm_id: number;
    name?: string;
    state?: string;
    country?: string;
  };
}

export const searchPlaces = async (
  query: string,
  signal?: AbortSignal,
): Promise<PlaceSuggestion[]> => {
  const params = new URLSearchParams({
    q: query,
    limit: "5",
    lang: "en",
    // Cities and towns only, as locations are stored per city
    layer: "city",
  });

  const response = await fetch(`${GEOCODER_URL}/api?${params}`, { signal });

  if (!response.ok) {
    throw new Error(`Place search failed with status ${response.status}`);
  }

  const { features }: { features: PhotonFeature[] } = await response.json();

  return features
    .filter((feature) => feature.properties.name)
    .map(({ geometry, properties }) => ({
      id: `${properties.osm_type}${properties.osm_id}`,
      label: [properties.name, properties.state, properties.country]
        .filter(Boolean)
        .join(", "),
      lng: geometry.coordinates[0],
      lat: geometry.coordinates[1],
    }));
};
