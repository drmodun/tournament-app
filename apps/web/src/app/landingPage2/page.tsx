import React from "react";
import styles from "./index.module.scss";
import Hero from "views/hero";
import Navbar from "views/navbar";
import AboutWinning from "views/aboutWinning";
import Contact from "views/contact";
import Promote from "views/promote";
import ProfileAchievements from "views/profileAchievements";

export default function LandingPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <Hero />
      </div>
      <div className={styles.screen} id="aboutWinning">
        <AboutWinning />
      </div>
      <div className={styles.screen} id="promote">
        <Promote />
      </div>
      <div className={styles.screen} id="contact">
        <Contact />
      </div>
      <div className={styles.screen} id="profileAchievements">
        <ProfileAchievements />
      </div>
    </div>
  );
}
