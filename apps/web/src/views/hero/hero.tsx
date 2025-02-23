"use client";

import React from "react";
import styles from "./hero.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";

export default function Hero() {
  const { theme } = useThemeContext();
  return (
    <div className={styles.wrapper}>
      <h1
        className={clsx(
          globals.titleText,
          styles.header,
          styles[`${textColor(theme)}Header`],
        )}
      >
        winning.sh
      </h1>
      <div className={styles.subheader}>
        <div className={styles.subheaderTextWrapper}>
          <h2
            className={clsx(
              styles.subheaderText,
              globals.headerText,
              globals[`${textColor(theme)}Color`],
            )}
          >
            organize <br /> your future <br />
            events and
            <br /> competitions
          </h2>
          <div
            className={clsx(
              styles.imageAligner,
              theme == "light" && styles.invertImageColor,
            )}
          />
        </div>
      </div>
    </div>
  );
}
