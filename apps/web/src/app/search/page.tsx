import styles from "./index.module.scss";
import Navbar from "views/navbar";
import { clsx } from "clsx";
import Competition from "views/competition";
import { fetchCompetition } from "api/client/hooks/competitions/serverFetches";
import { useToastContext } from "utils/hooks/useToastContext";
import VerifyUser from "views/verifyUser";
import PasswordReset from "views/passwordReset";
import RequestPasswordReset from "views/requestPasswordReset";
import Search from "views/search";

export default async function SearchPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div>
        <div className={clsx(styles.screen)}>
          <Search />
        </div>
      </div>
    </div>
  );
}
