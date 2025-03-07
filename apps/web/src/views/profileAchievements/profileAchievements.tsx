"use client";

import { clsx } from "clsx";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./profileAchievements.module.scss";

export default function ProfileAchievements() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  return (
    <div className={styles.wrapper}>
      <div className={styles.leftContent}>
        <h1
          className={clsx(
            globals.titleText,
            styles.header,
            styles[`${textColorTheme}Header`],
          )}
        >
          track your success and level up!
        </h1>
        <p className={clsx(styles.text, globals[`${textColorTheme}Color`])}>
          winning.sh celebrates your competitive journey with personalized
          profiles that showcase your achievements and elo ranking ✨. compete,
          win, and watch as you level up through the ranks 🚀💪. unlock badges
          🏅, display your victories, and track your rise to the top of the
          leaderboard! 📊🔥
        </p>
      </div>
      <div className={styles.imageWrapper}>
        <img
          className={clsx(styles.image)}
          src="https://images.unsplash.com/photo-1664223308213-1e38a28be35f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Person analyzing statistics on a computer."
        />
      </div>
    </div>
  );
}
