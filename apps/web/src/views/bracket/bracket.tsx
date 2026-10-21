"use client";

import {
  IMatchupResponseWithResults,
  IStageResponseWithChallongeTournament,
  IStageStandingsResponse,
} from "@tournament-app/types";
import { clsx } from "clsx";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./bracket.module.scss";

interface ReactBracketsTeam {
  id?: number;
  name: string;
  score?: string;
}

interface ReactBracketsSeed {
  id: string | number;
  date: string;
  teams: [ReactBracketsTeam, ReactBracketsTeam];
  winner?: number;
  score?: string;
}

interface ReactBracketsRound {
  title: string;
  seeds: ReactBracketsSeed[];
}

export interface ReactBracketsData {
  stageId: number;
  stageName: string;
  rounds: ReactBracketsRound[];
}

// The results endpoint includes who entered each roster, beyond what IRosterResponse declares
type ResultWithEntrant = IMatchupResponseWithResults["results"][number] & {
  roster: {
    participation?: {
      user?: { name?: string } | null;
      group?: { name?: string } | null;
    };
  };
};

const entrantName = (result: ResultWithEntrant) =>
  result.roster?.participation?.group?.name ??
  result.roster?.participation?.user?.name ??
  `Roster ${result.roster?.id}`;

const roundTitle = (round: number, roundCount: number) => {
  if (round === roundCount) return "Final";
  if (round === roundCount - 1) return "Semi-finals";
  return `Round ${round}`;
};

const BRACKET_TITLES: Record<string, string> = {
  winners: "Winners bracket",
  losers: "Losers bracket",
  last_chance: "Last-chance bracket",
  grand_final: "Grand final",
  east: "East bracket",
  west: "West bracket",
  north: "North bracket",
  south: "South bracket",
  northeast: "Northeast bracket",
  northwest: "Northwest bracket",
  southeast: "Southeast bracket",
  southwest: "Southwest bracket",
};

// In the order they are shown: double and triple elimination, then compass
const BRACKET_ORDER = Object.keys(BRACKET_TITLES);

function MatchupCard({ matchup }: { matchup: IMatchupResponseWithResults }) {
  return (
    <ol className={styles.matchup}>
      {(matchup.results as ResultWithEntrant[]).map((result) => (
        <li key={result.id} className={clsx(result.isWinner && styles.winner)}>
          {entrantName(result)}
        </li>
      ))}
      {matchup.results.length === 1 && <li className={styles.bye}>bye</li>}
    </ol>
  );
}

// Rounds side by side, matchups in the order they were drawn; byes show a single entrant.
// Knockout rounds are named by distance to the final.
function Rounds({
  matchups,
  isKnockout,
}: {
  matchups: IMatchupResponseWithResults[];
  isKnockout: boolean;
}) {
  const rounds = new Map<number, IMatchupResponseWithResults[]>();

  for (const matchup of [...matchups].sort((a, b) => a.id - b.id)) {
    rounds.set(matchup.round, [...(rounds.get(matchup.round) ?? []), matchup]);
  }

  // The bracket may not be fully drawn yet; the final round is when one matchup is left
  const lastRound = Math.max(...Array.from(rounds.keys()));
  const roundCount =
    lastRound +
    Math.max(0, Math.ceil(Math.log2(rounds.get(lastRound)!.length)));

  return (
    <div className={styles.rounds}>
      {Array.from(rounds.entries())
        .sort(([a], [b]) => a - b)
        .map(([round, roundMatchups]) => (
          <section key={round} className={styles.round}>
            <h3>
              {isKnockout ? roundTitle(round, roundCount) : `Round ${round}`}
            </h3>
            {roundMatchups.map((matchup) => (
              <MatchupCard key={matchup.id} matchup={matchup} />
            ))}
          </section>
        ))}
    </div>
  );
}

function Standings({
  standings,
  names,
}: {
  standings: IStageStandingsResponse;
  names: Map<number, string>;
}) {
  const isTable =
    standings.format === "round_robin" || standings.format === "swiss";

  return (
    <section className={styles.standings}>
      <h3>{standings.isFinished ? "Final standings" : "Standings"}</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Entrant</th>
            <th title="wins">W</th>
            {isTable && <th title="draws">D</th>}
            <th title="losses">L</th>
            {isTable && <th>Points</th>}
            {standings.format === "swiss" && <th title="Buchholz">Buch.</th>}
          </tr>
        </thead>
        <tbody>
          {standings.standings.map((row) => (
            <tr key={row.rosterId}>
              <td>{row.place}</td>
              <td>{names.get(row.rosterId) ?? `Roster ${row.rosterId}`}</td>
              <td>{row.wins + row.byes}</td>
              {isTable && <td>{row.draws}</td>}
              <td>{row.losses}</td>
              {isTable && <td>{row.points}</td>}
              {standings.format === "swiss" && <td>{row.buchholz}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function LocalBracket({
  matchups,
  standings,
}: {
  matchups: IMatchupResponseWithResults[];
  standings?: IStageStandingsResponse | null;
}) {
  const names = new Map<number, string>();

  for (const matchup of matchups) {
    for (const result of matchup.results as ResultWithEntrant[]) {
      names.set(result.roster?.id, entrantName(result));
    }
  }

  // Double and triple elimination and compass: one row of rounds per bracket
  const brackets = BRACKET_ORDER.map((bracket) => ({
    bracket,
    matchups: matchups.filter((m) => m.bracket === bracket),
  })).filter(({ matchups }) => matchups.length);

  return (
    <div className={styles.local}>
      {brackets.length ? (
        brackets.map(({ bracket, matchups }) => (
          <section key={bracket} className={styles.bracket}>
            <h2>{BRACKET_TITLES[bracket]}</h2>
            <Rounds matchups={matchups} isKnockout={false} />
          </section>
        ))
      ) : (
        <Rounds
          matchups={matchups}
          isKnockout={!standings || standings.format === "single_elimination"}
        />
      )}
      {standings && standings.standings.length > 0 && (
        <Standings standings={standings} names={names} />
      )}
    </div>
  );
}

export default function BracketView({
  stage,
  matchups = [],
  standings,
  runsOnChallonge = !!stage?.challongeTournamentId,
}: {
  stage?: IStageResponseWithChallongeTournament;
  matchups?: IMatchupResponseWithResults[];
  standings?: IStageStandingsResponse | null;
  // Whether the matches are Challonge's; otherwise the bracket is drawn from the matchups
  runsOnChallonge?: boolean;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
        globals[`${theme}Color`],
      )}
    >
      {runsOnChallonge && stage?.challongeTournamentId ? (
        <iframe
          src={`https://challonge.com/${stage?.challongeTournamentId}/module?theme=8396&show_standings=1&multiplier=1.75`}
          width="100%"
          height="500"
          style={{ border: "none" }}
          allowTransparency={true}
        />
      ) : matchups.some((m) => m.round != null) ? (
        <LocalBracket
          matchups={matchups.filter((m) => m.round != null)}
          standings={standings}
        />
      ) : (
        <p className={`${globals[`${theme}Color`]}`}>no bracket data</p>
      )}
    </div>
  );
}
