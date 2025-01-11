import React from "react";
import styles from "./index.module.scss";
import Navbar from "views/navbar";
import PromotedEvents from "views/promotedEvents";
import MapSidebar from "views/mapSidebar";

export default function LandingPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <div className={styles.promotedEvents}>
          <PromotedEvents />
        </div>
      </div>
      <div className={styles.sidebar}>
        <MapSidebar />
      </div>
    </div>
  );
}
