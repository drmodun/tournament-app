"use server";

import ManageInterests from "views/manageInterests";
import Navbar from "views/navbar";
import styles from "styles/pages/pageManage.module.scss";

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
