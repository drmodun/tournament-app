import { fetchCompetition } from "api/client/hooks/competitions/serverFetches";
import { clsx } from "clsx";
import Competition from "views/competition";
import Navbar from "views/navbar";
import styles from "./index.module.scss";

export default async function Contest({
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
          <Competition competition={res} />
        </div>
      </div>
    </div>
  );
}
