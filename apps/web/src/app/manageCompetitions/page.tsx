import styles from "./index.module.scss";
import Navbar from "views/navbar";
import { clsx } from "clsx";
import ManageCompetitions from "views/manageCompetitions";

export default function Competitions() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div>
        <div className={clsx(styles.screen)}>
          <ManageCompetitions />
        </div>
      </div>
    </div>
  );
}
