import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

const MAP_MARKER_COLOR = {
  background: "#21262c",
  glyph: "#59c3c3",
  border: "#197bbd",
};

export type PoiType = "programming" | "sports" | "other";

export type Poi = {
  id: string;
  description: string;
  name: string;
  type: PoiType;
  location: google.maps.LatLngLiteral;
};

export type MarkerLocation = {
  location: google.maps.LatLngLiteral;
  pois: Poi[];
};

const handleMarkerClick = (location: MarkerLocation) => {
  location;
};

export const PoiMarkers = (props: {
  locations: MarkerLocation[];
  onMarkerClick?: (location: MarkerLocation) => void;
}) => {
  return (
    <>
      {props.locations.map((location: MarkerLocation) => (
        <AdvancedMarker
          position={location.location}
          clickable={true}
          onClick={() => {
            handleMarkerClick(location);
            props.onMarkerClick && props.onMarkerClick(location);
          }}
        >
          <Pin
            background={MAP_MARKER_COLOR.background}
            glyphColor={MAP_MARKER_COLOR.glyph}
            borderColor={MAP_MARKER_COLOR.border}
          />
        </AdvancedMarker>
      ))}
    </>
  );
};
