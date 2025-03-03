"use server";

import ManageGroupInvites from "views/manageGroupInvites";
import Navbar from "views/navbar";
import styles from "./index.module.scss";

export default async function GroupInvites() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <ManageGroupInvites />
      </div>
    </div>
  );
}
