"use client";

import React from "react";
import styles from "./index.module.scss";
import Navbar from "views/navbar";
import LoginForm from "views/loginForm";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";

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
