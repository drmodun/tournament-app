import { fetchCompetition } from "api/client/hooks/competitions/serverFetches";
import ManageStages from "views/manageStages";
import Navbar from "views/navbar";
import styles from "./index.module.scss";

export default async function Stages({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;
  const res = await fetchCompetition(id);

  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <ManageStages tournamentId={id} />
      </div>
    </div>
  );
}
