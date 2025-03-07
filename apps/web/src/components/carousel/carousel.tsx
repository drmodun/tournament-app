"use client";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { clsx } from "clsx";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { Variants, textColor } from "types/styleTypes";
import styles from "./carousel.module.scss";

interface CarouselElement {
  title: string;
  image: string;
  description?: string;
}

interface CarouselProps {
  style?: React.CSSProperties;
  variant?: Variants;
  data?: CarouselElement[];
}

export default function Carousel({
  style,
  variant = "light",
  data = [],
}: CarouselProps) {
  const [index, setIndex] = useState<number>(0);

  const forward = () =>
    setIndex((index) => Math.abs((index + 1) % data.length));
  const back = () => setIndex((index) => Math.abs((index - 1) % data.length));

  return (
    <div
      className={clsx(styles.wrapper, globals[`${variant}BackgroundColor`])}
      style={style}
    >
      <img
        src={data[index]?.image}
        alt={data[index]?.description}
        className={clsx(
          styles.image,
          globals[`${variant == "light" ? "dark" : "light"}Border`],
        )}
        title={data[index]?.description}
      />
      <p
        className={clsx(styles.title, globals[`${textColor(variant)}Color`])}
        title={data[index]?.description}
      >
        {data[index]?.title ?? ""}
      </p>
      <button className={clsx(styles.arrowBack, styles.arrow)} onClick={back}>
        <ArrowBackIosIcon />
      </button>
      <button
        className={clsx(styles.arrowForward, styles.arrow)}
        onClick={forward}
      >
        <ArrowForwardIosIcon />
      </button>
    </div>
  );
}
