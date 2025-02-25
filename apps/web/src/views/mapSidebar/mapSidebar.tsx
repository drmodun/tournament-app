"use client";

import styles from "./mapSidebar.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";
import { MarkerLocation, Poi } from "utils/mixins/maps";
import PlaceIcon from "@mui/icons-material/Place";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Chip from "components/chip";
import Link from "next/link";

export default function ManageCompetitions() {
  const [selectedLocation, setSelectedLocation] = useState<
    MarkerLocation | undefined
  >({
    pois: [
      {
        id: "d",
        description: "hi guys broj 4",
        type: "programming",
        name: "obicno ime",
        location: { lat: 3.8605523, lng: 0.1972205 },
      },
      {
        id: "e",
        description: "hi guys broj 5",
        type: "programming",
        name: "EXPLOEDESSSSSSDASDSADA",
        location: { lat: 3.8605523, lng: 0.1972205 },
      },
      {
        id: "žnj",
        description: "hi guys broj 5",
        type: "programming",
        name: "EXPLOEDESSSSSSDASDSADA",
        location: { lat: 3.8605523, lng: 0.1972205 },
      },
    ],
    location: { lat: 63.8690081, lng: 151.2052393 },
  });
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const dummyLocations: MarkerLocation[] = [
    {
      pois: [
        {
          id: "a",
          description: "hi guys",
          type: "programming",
          name: "SHOW ME THE POWER CHILD ID LIKE TO SAY THAT IM DOWN ON MY KNEES TODAYYYY YAY",
          location: { lat: 3.8605523, lng: 0.1972205 },
        },
      ],
      location: { lat: 93.8567844, lng: 151.213108 },
    },
    {
      pois: [
        {
          id: "b",
          description: "hi guys number 2",
          type: "sports",
          name: "WACHIMBIKAMAGADDDDDDD",
          location: { lat: 3.8605523, lng: 0.1972205 },
        },
      ],
      location: { lat: 33.8472767, lng: 51.2188164 },
    },
    {
      pois: [
        {
          id: "c",
          description: "hi guys numero tres",
          type: "programming",
          name: "SYMPHONY OF DESTRUCTIONNNN!!!!",
          location: { lat: 3.8605523, lng: 0.1972205 },
        },
      ],
      location: { lat: -33.8209738, lng: 40.2563253 },
    },
    {
      pois: [
        {
          id: "d",
          description: "hi guys broj 4",
          type: "programming",
          name: "obicno ime",
          location: { lat: 3.8605523, lng: 0.1972205 },
        },
        {
          id: "e",
          description: "hi guys broj 5",
          type: "programming",
          name: "EXPLOEDESSSSSSDASDSADA",
          location: { lat: 3.8605523, lng: 0.1972205 },
        },
        {
          id: "žnj",
          description: "hi guys broj 5",
          type: "programming",
          name: "EXPLOEDESSSSSSDASDSADA",
          location: { lat: 3.8605523, lng: 0.1972205 },
        },
      ],
      location: { lat: 63.8690081, lng: 151.2052393 },
    },
    {
      pois: [
        {
          id: "f",
          description: "hi vro broj 6",
          type: "sports",
          name: "SWAYING TO THE SYMPHONY OF DESTRUCTIONNNNNNNNN",
          location: { lat: 3.8605523, lng: 0.1972205 },
        },
      ],
      location: { lat: -33.8665445, lng: 151.1989808 },
    },
    {
      pois: [
        {
          id: "g",
          description: "hi guys number 7even",
          type: "other",
          name: "baram bam baram bam bububub baram bam",
          location: { lat: 3.8605523, lng: 0.1972205 },
        },
      ],
      location: { lat: -33.869627, lng: 151.202146 },
    },
    {
      pois: [
        {
          id: "h",
          description: "hi guys 8",
          type: "other",
          name: "dummy nume",
          location: { lat: 3.8605523, lng: 0.1972205 },
        },
      ],
      location: { lat: 133.87488, lng: 160.1987113 },
    },
    {
      pois: [
        {
          id: "i",
          description: "hi guys 99999999",
          type: "other",
          name: "man",
          location: { lat: 3.8605523, lng: 0.1972205 },
        },
      ],
      location: { lat: 3.8605523, lng: 0.1972205 },
    },
  ];

  const handleClick = (location: MarkerLocation) => {
    setSelectedLocation(location);
    console.log(location);
  };

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sidebarRef?.current?.addEventListener("wheel", (e) => {
      sidebarRef!.current!.scrollTop += e.deltaY / 3;
    });
  }, []);

  return (
    <div className={clsx(styles.wrapper)}>
      <div className={clsx(styles.innerWrapper)}>
        <div className={styles.mapWrapper}>
          {/*  TODO: enable in prod, saving credits for now
          <Map
            locations={dummyLocations}
            onMarkerClick={handleClick}
            className={styles.map}
          />*/}
          <div className={styles.map} style={{ background: "black" }}></div>
        </div>
        <div className={styles.locationInfos} ref={sidebarRef}>
          {selectedLocation &&
            selectedLocation.pois.map((poi) => (
              <div className={styles.locationInfoWrapper} key={poi.id}>
                <LocationInfo poi={poi} />
              </div>
            ))}
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
            className={clsx(
              globals.largeText,
              globals[`${theme}Color`],
              styles.poiTitle,
            )}
            title={poi.name}
          >
            {poi.name}
          </b>
        </div>
        <p className={clsx(globals[`${theme}Color`])}>{poi.description}</p>
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
