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
  const [stage, standings] = await Promise.all([
    fetchStageWithChallonge(id),
    fetchStageStandings(id),
  ]);
  // The API says whose bracket it is. A stage can have a Challonge tournament and still have been
  // run by the API, so the tournament's id alone does not tell.
  const runsOnChallonge = standings
    ? standings.runsOnChallonge
    : !!stage?.challongeTournamentId;
  // Stages run by the API are drawn from their matchups
  const matchups = runsOnChallonge ? [] : await fetchStageResults(id);

  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <Bracket
          stage={stage}
          matchups={matchups}
          standings={standings}
          runsOnChallonge={runsOnChallonge}
        />
      </div>
    </div>
  );
}
