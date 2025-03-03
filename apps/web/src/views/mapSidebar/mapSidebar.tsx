"use client";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PlaceIcon from "@mui/icons-material/Place";
import { useGetLocations } from "api/client/hooks/locations/useGetLocations";
import { clsx } from "clsx";
import Chip from "components/chip";
import MapElement from "components/map";
import ProgressWheel from "components/progressWheel";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { MarkerLocation, Poi } from "utils/mixins/maps";
import styles from "./mapSidebar.module.scss";

export default function ManageCompetitions() {
  const [selectedLocation, setSelectedLocation] = useState<MarkerLocation>();

  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const { data, isLoading } = useGetLocations();

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sidebarRef?.current?.addEventListener("wheel", (e) => {
      if (sidebarRef?.current) sidebarRef.current.scrollTop += e.deltaY / 3;
    });
  }, []);

  return (
    <div className={clsx(styles.wrapper)}>
      <div className={clsx(styles.innerWrapper)}>
        <div className={styles.mapWrapper}>
          {isLoading ? (
            <ProgressWheel variant={textColorTheme} />
          ) : (
            <>
              <MapElement
                onMarkerClick={(location: MarkerLocation) => {
                  setSelectedLocation(location);
                }}
                className={styles.mapElement}
                locations={
                  data &&
                  data.pages[0]?.results?.map((poi) => {
                    return {
                      location: {
                        lat: (poi?.coordinates ?? [0, 0])[1],
                        lng: (poi?.coordinates ?? [0, 0])[0],
                      },
                      pois: [
                        {
                          id: poi?.apiId,
                          location: {
                            lat: (poi?.coordinates ?? [0, 0])[1],
                            lng: (poi?.coordinates ?? [0, 0])[0],
                          },
                          description: "",
                          name: poi?.name,
                          type: "other",
                        },
                      ],
                    };
                  })
                }
              />
              <div className={styles.locationInfos} ref={sidebarRef}>
                {selectedLocation &&
                  selectedLocation.pois.map((poi) => (
                    <div className={styles.locationInfoWrapper} key={poi.id}>
                      <LocationInfo poi={poi} />
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const LocationInfo = ({ poi }: { poi: Poi }) => {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  return (
    <div
      className={clsx(
        globals[`${textColorTheme}BackgroundColorDynamic`],
        styles.locationInfo,
      )}
    >
      <div className={styles.top}>
        <div>
          <b
            className={clsx(globals[`${theme}Color`], styles.poiTitle)}
            title={poi.name}
          >
            {poi.name}
          </b>
        </div>
        <p className={clsx(globals[`${theme}Color`])}>
          {Math.abs(poi.location.lat)}
          {poi.location.lat < 0 ? <>&deg;S</> : <>&deg;N</>},{" "}
          {Math.abs(poi.location.lng)}
          {poi.location.lng < 0 ? <>&deg;W</> : <>&deg;E</>}
        </p>
      </div>
      <div className={styles.bottom}>
        <div className={styles.bottomLeft}>
          <Link
            href={`https://www.google.com/maps/place/${poi.location.lat},${poi.location.lng}`}
          >
            <PlaceIcon className={clsx(styles.primaryFill)} />
          </Link>
          <Chip variant={theme} label={poi.type} />
        </div>
        <ArrowForwardIosIcon className={clsx(styles[`${theme}Fill`])} />
      </div>
    </div>
  );
};
