"use client";

import {
  IMatchupResponseWithResults,
  IStageResponseWithChallongeTournament,
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

// Rounds side by side, matchups in bracket order; byes show a single entrant
function LocalBracket({
  matchups,
}: {
  matchups: IMatchupResponseWithResults[];
}) {
  const rounds = new Map<number, IMatchupResponseWithResults[]>();

  for (const matchup of [...matchups].sort((a, b) => a.id - b.id)) {
    rounds.set(matchup.round, [...(rounds.get(matchup.round) ?? []), matchup]);
  }

  // The bracket may not be fully drawn yet; the final round is when one matchup is left
  const lastRound = Math.max(...Array.from(rounds.keys()));
  const roundCount =
    lastRound + Math.max(0, Math.ceil(Math.log2(rounds.get(lastRound)!.length)));

  return (
    <div className={styles.rounds}>
      {Array.from(rounds.entries())
        .sort(([a], [b]) => a - b)
        .map(([round, roundMatchups]) => (
          <section key={round} className={styles.round}>
            <h3>{roundTitle(round, roundCount)}</h3>
            {roundMatchups.map((matchup) => (
              <ol key={matchup.id} className={styles.matchup}>
                {(matchup.results as ResultWithEntrant[]).map((result) => (
                  <li
                    key={result.id}
                    className={clsx(result.isWinner && styles.winner)}
                  >
                    {entrantName(result)}
                  </li>
                ))}
                {matchup.results.length === 1 && (
                  <li className={styles.bye}>bye</li>
                )}
              </ol>
            ))}
          </section>
        ))}
    </div>
  );
}

export default function BracketView({
  stage,
  matchups = [],
}: {
  stage?: IStageResponseWithChallongeTournament;
  matchups?: IMatchupResponseWithResults[];
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
      )}
    >
      {stage?.challongeTournamentId ? (
        <iframe
          src={`https://challonge.com/${stage?.challongeTournamentId}/module?theme=8396&show_standings=1&multiplier=1.75`}
          width="100%"
          height="500"
          style={{ border: "none" }}
          allowTransparency={true}
        />
      ) : matchups.some((m) => m.round != null) ? (
        <LocalBracket matchups={matchups.filter((m) => m.round != null)} />
      ) : (
        <p className={`${globals[`${theme}Color`]}`}>no bracket data</p>
      )}
    </div>
  );
}
