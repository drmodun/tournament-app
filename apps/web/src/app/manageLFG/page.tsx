import ManageLFG from "views/manageLFG";
import Navbar from "views/navbar";
import styles from "./index.module.scss";
import BrowseLFPs from "views/browseLFPs";

export default async function User() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <ManageLFG />
        <BrowseLFPs />
      </div>
    </div>
  );
}
