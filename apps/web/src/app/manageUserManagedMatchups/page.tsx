import ManageUserManagedMatchups from "views/manageUserManagedMatchups";
import Navbar from "views/navbar";
import styles from "styles/pages/pageManageTabs.module.scss";

export default async function Matchups() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <ManageUserManagedMatchups />
      </div>
    </div>
  );
}
