import React from "react";
import styles from "./index.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Button from "components/button";
import trophies from "/public/trophies.png";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Image
          src={trophies}
          alt="Trophies background."
          className={styles.trophies}
        />
        <h1 className={clsx(globals.headerText, styles.headerText)}>
          winning.sh
        </h1>
        <p className={clsx(globals.largeText, styles.description)}>
          organize your future events and competitions.
        </p>
      </div>

      <div className={styles.content}>
        <p className={clsx(globals.largeText, styles.descriptionSmall)}>
          organize your future events and competitions.
        </p>
        <div className={styles.bluewashing1}>
          <img
            src="https://images.unsplash.com/photo-1648484860045-f7fdac111d3f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt=""
            className={clsx(styles.image, styles.image1)}
          ></img>
        </div>
        <div className={styles.bluewashing2}>
          <img
            src="https://live.staticflickr.com/5660/30710056966_cbce3e669e_b.jpg"
            alt=""
            className={clsx(styles.image, styles.image2)}
          ></img>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.infiniteWrapper}>
            <div className={styles.infinite}></div>
          </div>
          <div className={styles.buttonWrapper}>
            <div className={styles.buttons}>
              <Button label="login" variant="light" className={styles.button} />
              <Button
                label="join"
                variant="primary"
                className={styles.button}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
