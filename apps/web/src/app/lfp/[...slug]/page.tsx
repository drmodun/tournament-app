import styles from "./index.module.scss";
import Navbar from "views/navbar";
import { clsx } from "clsx";
import Competition from "views/competition";
import { fetchCompetition } from "api/client/hooks/competitions/serverFetches";
import { useToastContext } from "utils/hooks/useToastContext";
import ViewLFP from "views/viewLFP";

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
