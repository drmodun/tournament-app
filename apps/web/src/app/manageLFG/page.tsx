import { fetchUser } from "api/client/hooks/user/serverFetches";
import styles from "./index.module.scss";
import Navbar from "views/navbar";
import UserProfile from "views/userProfile";
import ManageLFG from "views/manageLFG";

export default async function User() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <ManageLFG />
      </div>
    </div>
  );
}
