import React, { MouseEventHandler } from "react";
import styles from "./index.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Button from "../../components/button";

export default function LandingPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={globals.headerText}>winning.sh</h1>
      </div>
      <div className={styles.content}>
        <img
          src="https://images.unsplash.com/photo-1648484860045-f7fdac111d3f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          className={styles.image}
        />
        <img
          src="https://images.unsplash.com/photo-1648484860045-f7fdac111d3f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          className={clsx(styles.image, styles.image2)}
        />
        <div className={styles.contentGrid}>
          <p className={globals.largeText}>
            organize your future events and competitions.
          </p>
          <div className={styles.buttons}>
            <Button label="login" variant="light" className={styles.button} />
            <Button label="join" variant="primary" className={styles.button} />
          </div>
        </div>
      </div>
    </div>
  );
}
