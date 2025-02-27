import styles from "./map.module.scss";
import { MarkerLocation, PoiMarkers } from "utils/mixins/maps";
import { Map, MapProps } from "@vis.gl/react-google-maps";
import { clsx } from "clsx";

interface RadioGroupProps {
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
}: RadioGroupProps) {
  return (
    <Map
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
