import {
  APILoadingStatus,
  ColorScheme,
  Map,
  MapProps,
  useApiLoadingStatus,
} from "@vis.gl/react-google-maps";
import { clsx } from "clsx";
import React from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { MarkerLocation, PoiMarkers } from "utils/mixins/maps";
import styles from "./map.module.scss";

interface MapLocationProps {
  style?: React.CSSProperties;
  props?: MapProps;
  className?: string;
  locations?: MarkerLocation[];
   
  onMarkerClick?: (location: MarkerLocation) => void;
}

// The Google Maps script throws inside marker code when the key is missing or rejected.
// Without a boundary that takes down the whole page, so contain it to the map area.
class MapErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function MapComponent({
  style,
  props,
  className,
  locations = [],
  onMarkerClick,
}: MapLocationProps) {
  const { theme } = useThemeContext();
  const status = useApiLoadingStatus();

  const unavailable = (
    <div
      className={clsx(className, styles.map, styles.unavailable)}
      style={style}
    >
      map unavailable
    </div>
  );

  const isRejected =
    status === APILoadingStatus.AUTH_FAILURE ||
    status === APILoadingStatus.FAILED;

  // The boundary stays mounted in every state: markers throw while unmounting after an
  // auth failure, and that error has to land here rather than at the app root.
  return (
    <MapErrorBoundary fallback={unavailable}>
      {isRejected ? (
        unavailable
      ) : (
        <Map
          colorScheme={theme === "light" ? ColorScheme.LIGHT : ColorScheme.DARK}
          defaultZoom={props?.defaultZoom ?? 2}
          defaultCenter={props?.defaultCenter ?? { lat: 35.467, lng: 4.233 }}
          mapId={"9364aaf5e6bef0a7"}
          className={clsx(className, styles.map)}
          style={style}
        >
          {status === APILoadingStatus.LOADED && (
            <PoiMarkers locations={locations} onMarkerClick={onMarkerClick} />
          )}
        </Map>
      )}
    </MapErrorBoundary>
  );
}
