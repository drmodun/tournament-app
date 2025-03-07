import { clsx } from "clsx";
import Navbar from "views/navbar";
import PasswordReset from "views/passwordReset";
import styles from "./index.module.scss";

export default async function ResetPassword({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const token = (await params).token;
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div>
        <div className={clsx(styles.screen)}>
          <PasswordReset token={token} />
        </div>
      </div>
    </div>
  );
}
