import { fetchStage } from "api/client/hooks/stages/serverFetches";
import ManageStage from "views/manageStage";
import Navbar from "views/navbar";
import styles from "./index.module.scss";

export default async function Stages({
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
        <ManageStage stage={res} />
      </div>
    </div>
  );
}
