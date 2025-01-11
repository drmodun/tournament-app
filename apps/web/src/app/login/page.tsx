import React from "react";
import styles from "./index.module.scss";
import Navbar from "views/navbar";
import LoginForm from "views/loginForm";

export default function LoginPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <LoginForm variant="light" />
      </div>
    </div>
  );
}
