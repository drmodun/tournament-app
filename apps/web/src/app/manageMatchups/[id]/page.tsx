import { fetchStage } from "api/client/hooks/stages/serverFetches";
import ManageStage from "views/manageStage";
import Navbar from "views/navbar";
import styles from "./index.module.scss";
import ManageMatchups from "views/manageMatchups";

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
        <ManageMatchups stageId={id} />
      </div>
    </div>
  );
}
