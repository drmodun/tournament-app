"use client";

import { clsx } from "clsx";
import globals from "styles/globals.module.scss";
import { useThemeContext } from "utils/hooks/useThemeContext";
import AboutWinning from "views/aboutWinning";
import Contact from "views/contact";
import Hero from "views/hero";
import Navbar from "views/navbar";
import ProfileAchievements from "views/profileAchievements";
import Promote from "views/promote";
import styles from "./index.module.scss";

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
