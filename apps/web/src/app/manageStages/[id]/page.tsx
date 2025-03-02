import { fetchUser } from "api/client/hooks/user/serverFetches";
import styles from "./index.module.scss";
import Navbar from "views/navbar";
import UserProfile from "views/userProfile";
import { fetchCompetition } from "api/client/hooks/competitions/serverFetches";
import ManageStages from "views/manageStages";

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
        <ManageStages tournament={res} />
      </div>
    </div>
  );
}
