import { fetchStage } from "api/client/hooks/stages/serverFetches";
import ManageStage from "views/manageStage";
import Navbar from "views/navbar";
import styles from "./index.module.scss";
import { fetchFormattedBracket } from "api/client/hooks/matches/serverFetches";
import Bracket from "views/bracket";
import { formatBracketDateTimes } from "utils/mixins/formatting";

export default async function BracketPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;
  let res = await fetchFormattedBracket(id);
  res = formatBracketDateTimes(res);

  const stage = await fetchStage(id);

  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <Bracket bracket={res} stage={stage} />
      </div>
    </div>
  );
}
