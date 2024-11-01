import React from "react";
import styles from "./index.module.scss";
import Hero from "views/hero";
import Navbar from "views/navbar";
import AboutWinning from "views/aboutWinning";
import Contact from "views/contact";
import Promote from "views/promote";
import ProfileAchievements from "views/profileAchievements";
import LoginForm from "views/loginForm";

export default function LandingPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <LoginForm variant="light" />
      </div>
    </div>
  );
}
