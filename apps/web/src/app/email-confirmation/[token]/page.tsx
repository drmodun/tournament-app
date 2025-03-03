import { clsx } from "clsx";
import Navbar from "views/navbar";
import VerifyUser from "views/verifyUser";
import styles from "./index.module.scss";

export default async function EmailConfirmation({
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
          <VerifyUser token={token} />
        </div>
      </div>
    </div>
  );
}
