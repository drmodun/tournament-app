import { fetchUser } from "api/client/hooks/user/useGetUser";
import styles from "./index.module.scss";
import Navbar from "views/navbar";
import UserProfile from "views/userProfile";

export default async function User({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;
  const res = await fetchUser(id);
  console.log("RESPONSE", res);
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <UserProfile user={res} />
      </div>
    </div>
  );
}
