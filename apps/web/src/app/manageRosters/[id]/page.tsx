"use server";

import Navbar from "views/navbar";
import styles from "./index.module.scss";
import ManageRosters from "views/manageRosters";
import { fetchStage } from "api/client/hooks/stages/serverFetches";
import { AddRosterButton } from "views/manageRosters/manageRosters";

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
        <AddRosterButton stage={res} />
      </div>
    </div>
  );
}
