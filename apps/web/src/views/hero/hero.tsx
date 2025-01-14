import React from "react";
import styles from "./hero.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";

export default function Hero() {
  return (
    <div className={styles.wrapper}>
      <h1 className={clsx(globals.titleText, styles.header)}>winning.sh</h1>
      <div className={styles.subheader}>
        <div className={styles.subheaderTextWrapper}>
          <h2 className={clsx(styles.subheaderText, globals.headerText)}>
            organize <br /> your future <br />
            events and
            <br /> competitions
          </h2>
          <div className={styles.imageAligner} />
        </div>
      </div>
    </div>
  );
}
