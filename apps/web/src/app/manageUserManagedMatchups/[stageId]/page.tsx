import ManageUserManagedMatchups from "views/manageUserManagedMatchups";
import Navbar from "views/navbar";
import styles from "./index.module.scss";

export default async function Matchups({
  params,
}: {
  params: Promise<{ stageId: number }>;
}) {
  const id = (await params).stageId;

  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <ManageUserManagedMatchups stageId={id} />
      </div>
    </div>
  );
}
