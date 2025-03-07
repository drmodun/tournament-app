import { clsx } from "clsx";
import Navbar from "views/navbar";
import RequestPasswordReset from "views/requestPasswordReset";
import styles from "./index.module.scss";

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
