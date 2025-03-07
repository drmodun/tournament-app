import { ColorScheme, Map, MapProps } from "@vis.gl/react-google-maps";
import { clsx } from "clsx";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { MarkerLocation, PoiMarkers } from "utils/mixins/maps";
import styles from "./map.module.scss";

interface MapLocationProps {
  style?: React.CSSProperties;
  props?: MapProps;
  className?: string;
  locations?: MarkerLocation[];
  // eslint-disable-next-line no-unused-vars
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
      style={style}
    >
      <PoiMarkers locations={locations} onMarkerClick={onMarkerClick} />
    </Map>
  );
}
