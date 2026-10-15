import { clsx } from "clsx";
import Navbar from "views/navbar";
import RequestPasswordReset from "views/requestPasswordReset";
import styles from "styles/pages/pageSearch.module.scss";

export default async function ResetPasswordRequest() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div>
        <div className={clsx(styles.screen)}>
          <RequestPasswordReset />
        </div>
      </div>
    </div>
  );
}
