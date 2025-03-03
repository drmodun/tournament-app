import styles from "./index.module.scss";
import Navbar from "views/navbar";
import { clsx } from "clsx";
import Competition from "views/competition";
import { fetchCompetition } from "api/client/hooks/competitions/serverFetches";
import { useToastContext } from "utils/hooks/useToastContext";
import VerifyUser from "views/verifyUser";
import PasswordReset from "views/passwordReset";
import RequestPasswordReset from "views/requestPasswordReset";

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
