export type PoiType = "programming" | "sports" | "other";

export type LatLng = { lat: number; lng: number };

export type Poi = {
  id: string;
  description: string;
  name: string;
  type: PoiType;
  location: LatLng;
};

export type MarkerLocation = {
  id?: number;
  location: LatLng;
  pois: Poi[];
};
