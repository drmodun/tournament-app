"use client";

import { useThemeContext } from "utils/hooks/useThemeContext";
import LoginForm from "views/loginForm";
import Navbar from "views/navbar";
import styles from "./index.module.scss";

export default function LoginPage() {
  const { theme } = useThemeContext();

  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <LoginForm variant={theme} />
      </div>
    </div>
  );
}
