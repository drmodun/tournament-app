"use client";

import React, { useState } from "react";
import styles from "./carousel.module.scss";
import { Variants, Variant, LIGHT } from "../../types/styleTypes";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIosNew";

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
  const carouselVariant: Variant = new Variant(variant);

  const forward = () =>
    setIndex((index) => Math.abs((index + 1) % data.length));
  const back = () => setIndex((index) => Math.abs((index - 1) % data.length));

  return (
    <div
      className={styles.wrapper}
      style={{ backgroundColor: carouselVariant.color(), ...style }}
    >
      <img
        src={data[index]?.image ?? ""}
        alt={data[index]?.description ?? ""}
        className={styles.image}
        title={data[index]?.description ?? ""}
        style={{
          border: `2px solid ${carouselVariant.textColor()}`,
        }}
      />
      <p
        className={styles.title}
        style={{ color: carouselVariant.textColor() }}
        title={data[index]?.description ?? ""}
      >
        {data[index]?.title ?? ""}
      </p>
      <button className={`${styles.arrowBack} ${styles.arrow}`} onClick={back}>
        <ArrowBackIosIcon style={{ color: LIGHT }} />
      </button>
      <button
        className={`${styles.arrowForward} ${styles.arrow}`}
        onClick={forward}
      >
        <ArrowForwardIosIcon style={{ color: LIGHT }} />
      </button>
    </div>
  );
}
