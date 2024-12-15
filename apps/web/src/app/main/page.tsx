import React from "react";
import styles from "./index.module.scss";
import Navbar from "views/navbar";
import PromotedEvents from "views/promotedEvents";

export default function LandingPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <div
          style={{
            height: "75vh",
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <PromotedEvents />
          <PromotedEvents />
        </div>
      </div>
    </div>
  );
}
