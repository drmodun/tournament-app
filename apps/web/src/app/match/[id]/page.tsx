import Navbar from "views/navbar";
import ViewMatch from "views/viewMatchup";
import styles from "./index.module.scss";

export default async function Matchup({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;

  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <ViewMatch />
      </div>
    </div>
  );
}
