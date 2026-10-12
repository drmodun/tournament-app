"use client";

import { clsx } from "clsx";
import type { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { DARK, LIGHT } from "utils/mixins/constants";
import { LatLng, MarkerLocation } from "utils/mixins/maps";
import styles from "./map.module.scss";

// MapLibre GL with OpenStreetMap vector tiles from OpenFreeMap: open source, no API key.
// Point these at your own tile server or another MapLibre style to change the look.
const STYLE_URLS = {
  light:
    process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
    "https://tiles.openfreemap.org/styles/positron",
  dark:
    process.env.NEXT_PUBLIC_MAP_STYLE_URL_DARK ||
    "https://tiles.openfreemap.org/styles/dark",
};

type MapLibre = typeof import("maplibre-gl");

interface MapLocationProps {
  style?: React.CSSProperties;
  defaultCenter?: LatLng;
  defaultZoom?: number;
  className?: string;
  locations?: MarkerLocation[];
  onMarkerClick?: (location: MarkerLocation) => void;
}

export default function MapComponent({
  style,
  defaultCenter = { lat: 35.467, lng: 4.233 },
  defaultZoom = 1,
  className,
  locations = [],
  onMarkerClick,
}: MapLocationProps) {
  const { theme } = useThemeContext();
  const styleUrl = theme === "light" ? STYLE_URLS.light : STYLE_URLS.dark;

  const containerRef = useRef<HTMLDivElement>(null);
  const [maplibre, setMaplibre] = useState<MapLibre>();
  const [map, setMap] = useState<MapLibreMap>();
  const [isUnavailable, setIsUnavailable] = useState(false);

  // The newest props, readable from effects that should not re-run when they change
  const latest = useRef({ locations, onMarkerClick, styleUrl });
  latest.current = { locations, onMarkerClick, styleUrl };

  useEffect(() => {
    let createdMap: MapLibreMap | undefined;
    let isCancelled = false;

    // Loaded on demand: the library needs a browser, and most pages have no map
    import("maplibre-gl")
      .then((module) => {
        if (isCancelled || !containerRef.current) return;

        // The package is CommonJS; depending on the bundler its API sits on the default export
        const library: MapLibre =
          (module as { default?: MapLibre }).default ?? module;

        createdMap = new library.Map({
          container: containerRef.current,
          style: latest.current.styleUrl,
          center: [defaultCenter.lng, defaultCenter.lat],
          zoom: defaultZoom,
          // Collapsed to an info button, as the map is small
          attributionControl: { compact: true },
        });
        createdMap.addControl(
          new library.NavigationControl({ showCompass: false }),
          "top-right",
        );

        setMaplibre(library);
        setMap(createdMap);
      })
      // No WebGL, or the library failed to load: show a placeholder instead of breaking the page
      .catch(() => setIsUnavailable(true));

    return () => {
      isCancelled = true;
      createdMap?.remove();
    };
    // Runs once: later changes to the props are applied by the effects below
  }, []);

  useEffect(() => {
    map?.setStyle(styleUrl);
  }, [map, styleUrl]);

  // Markers are rebuilt only when the set of locations actually changes, not on every render
  const locationsKey = locations
    .map(({ id, location }) => `${id}:${location.lat},${location.lng}`)
    .join("|");

  useEffect(() => {
    if (!map || !maplibre) return;

    const markers = latest.current.locations.map((location) => {
      const marker = new maplibre.Marker({
        color: theme === "dark" ? LIGHT : DARK,
      })
        .setLngLat([location.location.lng, location.location.lat])
        .addTo(map);

      const element = marker.getElement();
      element.style.cursor = "pointer";
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        latest.current.onMarkerClick?.(location);
      });

      return marker;
    });

    return () => markers.forEach((marker) => marker.remove());
  }, [map, maplibre, locationsKey, theme]);

  if (isUnavailable) {
    return (
      <div
        className={clsx(className, styles.map, styles.unavailable)}
        style={style}
      >
        map unavailable
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={clsx(className, styles.map)}
      style={style}
    />
  );
}
