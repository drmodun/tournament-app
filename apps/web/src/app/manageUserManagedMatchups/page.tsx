import { fetchStage } from "api/client/hooks/stages/serverFetches";
import ManageStage from "views/manageStage";
import Navbar from "views/navbar";
import styles from "./index.module.scss";
import ManageMatchups from "views/manageMatchups";
import ManageUserManagedMatchups from "views/manageUserManagedMatchups";

export default async function Matchups({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;

  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <ManageUserManagedMatchups stageId={id} />
      </div>
    </div>
  );
}
