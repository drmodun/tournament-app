import { fetchCompetition } from "api/client/hooks/competitions/serverFetches";
import { clsx } from "clsx";
import Navbar from "views/navbar";
import ViewStages from "views/viewStages";
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
      <div>
        <div className={clsx(styles.screen)}>
          <ViewStages tournament={res} />
        </div>
      </div>
    </div>
  );
}
