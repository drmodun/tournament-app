"use server";

import { fetchStage } from "api/client/hooks/stages/serverFetches";
import ManageRosters from "views/manageRosters";
import Navbar from "views/navbar";
import styles from "./index.module.scss";

export default async function Rosters({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;
  const res = await fetchStage(id);

  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <ManageRosters stage={res} />
      </div>
    </div>
  );
}
