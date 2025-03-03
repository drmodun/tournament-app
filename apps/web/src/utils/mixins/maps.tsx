import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { DARK, LIGHT } from "./constants";

export type PoiType = "programming" | "sports" | "other";

export type Poi = {
  id: string;
  description: string;
  name: string;
  type: PoiType;
  location: google.maps.LatLngLiteral;
};

export type MarkerLocation = {
  id?: number;
  location: google.maps.LatLngLiteral;
  pois: Poi[];
};

const handleMarkerClick = (location: MarkerLocation) => {
  location;
};

export const PoiMarkers = (props: {
  locations: MarkerLocation[];
  // eslint-disable-next-line no-unused-vars
  onMarkerClick?: (location: MarkerLocation) => void;
}) => {
  const { theme } = useThemeContext();

  return (
    <>
      {props.locations.map((location: MarkerLocation) => (
        <AdvancedMarker
          key={
            location.location.lat +
            location.location.lng +
            location.pois.map((poi) => poi.id).join("")
          }
          position={location.location}
          clickable={true}
          onClick={() => {
            handleMarkerClick(location);
            props.onMarkerClick && props.onMarkerClick(location);
          }}
        >
          <Pin
            background={theme === "dark" ? DARK : LIGHT}
            glyphColor={theme === "dark" ? LIGHT : DARK}
            borderColor={theme === "dark" ? LIGHT : DARK}
          />
        </AdvancedMarker>
      ))}
    </>
  );
};
