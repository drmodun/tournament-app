import { fetchGroup } from "api/client/hooks/groups/serverFetches";
import { clsx } from "clsx";
import Group from "views/group";
import Navbar from "views/navbar";
import styles from "./index.module.scss";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;
  const res = await fetchGroup(id);
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div>
        <div className={clsx(styles.screen)}>
          <Group group={res} />
        </div>
      </div>
    </div>
  );
}
