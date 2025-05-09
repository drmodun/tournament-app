import { fetchUser } from "api/client/hooks/user/serverFetches";
import Navbar from "views/navbar";
import UserProfile from "views/userProfile";
import styles from "./index.module.scss";

export default async function User({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;
  const res = await fetchUser(id);

  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <UserProfile user={res} />
      </div>
    </div>
  );
}
