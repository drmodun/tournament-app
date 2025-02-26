import React from "react";
import styles from "./index.module.scss";
import Navbar from "views/navbar";
import RegisterForm from "views/registerForm";

export default function User() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <RegisterForm />
      </div>
    </div>
  );
}
