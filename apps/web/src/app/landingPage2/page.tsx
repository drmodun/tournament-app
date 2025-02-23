"use client";

import React from "react";
import styles from "./index.module.scss";
import globals from "styles/globals.module.scss";
import Hero from "views/hero";
import Navbar from "views/navbar";
import AboutWinning from "views/aboutWinning";
import Contact from "views/contact";
import Promote from "views/promote";
import ProfileAchievements from "views/profileAchievements";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { clsx } from "clsx";

export default function LandingPage() {
  const { theme } = useThemeContext();
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <Hero />
      </div>
      <div
        className={clsx(styles.screen, globals[`${theme}BackgroundColor`])}
        id="aboutWinning"
      >
        <AboutWinning />
      </div>
      <div
        className={clsx(styles.screen, globals[`${theme}BackgroundColor`])}
        id="promote"
      >
        <Promote />
      </div>
      <div
        className={clsx(styles.screen, globals[`${theme}BackgroundColor`])}
        id="contact"
      >
        <Contact />
      </div>
      <div
        className={clsx(styles.screen, globals[`${theme}BackgroundColor`])}
        id="profileAchievements"
      >
        <ProfileAchievements />
      </div>
    </div>
  );
}
