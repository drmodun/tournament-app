import { clsx } from "clsx";
import Navbar from "views/navbar";
import ViewLFP from "views/viewLFP";
import styles from "./index.module.scss";

export default async function LFP({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const slug = (await params).slug;

  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div>
        <div className={clsx(styles.screen)}>
          <ViewLFP lfpID={parseInt(slug[0])} groupID={parseInt(slug[1])} />
        </div>
      </div>
    </div>
  );
}
