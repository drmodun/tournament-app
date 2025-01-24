import styles from "./index.module.scss";
import Navbar from "views/navbar";
import { clsx } from "clsx";
import Competition from "views/competition";

export default function Contest() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div>
        <div className={clsx(styles.screen)}>
          <Competition />
        </div>
      </div>
    </div>
  );
}
