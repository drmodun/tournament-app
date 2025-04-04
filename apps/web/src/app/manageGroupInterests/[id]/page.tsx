"use server";

import ManageGroupInterests from "views/manageGroupInterests";
import Navbar from "views/navbar";
import styles from "./index.module.scss";

export default async function GroupInterests({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <ManageGroupInterests groupId={parseInt(`${id ?? -1}`)} />
      </div>
    </div>
  );
}
