"use server";

import ManageInterests from "views/manageInterests";
import Navbar from "views/navbar";
import styles from "./index.module.scss";

export default async function Interests() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <ManageInterests />
      </div>
    </div>
  );
}
