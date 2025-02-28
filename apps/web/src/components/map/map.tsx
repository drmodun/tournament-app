import styles from "./map.module.scss";
import { MarkerLocation, PoiMarkers } from "utils/mixins/maps";
import { ColorScheme, Map, MapProps } from "@vis.gl/react-google-maps";
import { clsx } from "clsx";
import { useThemeContext } from "utils/hooks/useThemeContext";

interface MapLocationProps {
  style?: React.CSSProperties;
  props?: MapProps;
  className?: string;
  locations?: MarkerLocation[];
  onMarkerClick?: (location: MarkerLocation) => void;
}

export default function MapComponent({
  style,
  props,
  className,
  locations = [],
  onMarkerClick,
}: MapLocationProps) {
  const { theme } = useThemeContext();
  return (
    <Map
      colorScheme={theme === "light" ? ColorScheme.LIGHT : ColorScheme.DARK}
      defaultZoom={props?.defaultZoom ?? 2}
      defaultCenter={props?.defaultCenter ?? { lat: 35.467, lng: 4.233 }}
      mapId={"9364aaf5e6bef0a7"}
      className={clsx(className, styles.map)}
    >
      <PoiMarkers locations={locations} onMarkerClick={onMarkerClick} />
    </Map>
  );
}
