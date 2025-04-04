import { fetchStage } from "api/client/hooks/stages/serverFetches";
import ManageStage from "views/manageStage";
import Navbar from "views/navbar";
import styles from "./index.module.scss";
import ManageMatchup from "views/manageMatchups";
import { fetchMatchup } from "api/client/hooks/matchups/serverFetches";

export default async function Matchups({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;
  const matchup = await fetchMatchup(id);

  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <ManageMatchup matchup={matchup} />
      </div>
    </div>
  );
}
