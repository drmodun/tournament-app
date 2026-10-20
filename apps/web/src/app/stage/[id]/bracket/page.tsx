import { fetchStageWithChallonge } from "api/client/hooks/stages/serverFetches";
import { fetchStageResults } from "api/client/hooks/matches/serverFetches";
import Bracket from "views/bracket";
import Navbar from "views/navbar";
import styles from "./index.module.scss";

export default async function BracketPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;
  const stage = await fetchStageWithChallonge(id);
  // Stages without Challonge are run by the API; their bracket is drawn from the matchups
  const matchups = stage?.challongeTournamentId
    ? []
    : await fetchStageResults(id);

  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <Bracket stage={stage} matchups={matchups} />
      </div>
    </div>
  );
}
