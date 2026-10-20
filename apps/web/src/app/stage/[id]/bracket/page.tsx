import { fetchStageWithChallonge } from "api/client/hooks/stages/serverFetches";
import {
  fetchStageResults,
  fetchStageStandings,
} from "api/client/hooks/matches/serverFetches";
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
  const [matchups, standings] = stage?.challongeTournamentId
    ? [[], null]
    : await Promise.all([fetchStageResults(id), fetchStageStandings(id)]);

  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <Bracket stage={stage} matchups={matchups} standings={standings} />
      </div>
    </div>
  );
}
