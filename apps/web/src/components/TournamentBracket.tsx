import { useEffect, useState } from "react";
import { Bracket, IRoundProps, Seed, SeedItem, SeedTeam } from "react-brackets";
import "../styles/bracket.css";
import { clientApi } from "api/client/base";

interface TournamentBracketProps {
  stageId: number;
}

interface ReactBracketsTeam {
  id?: number;
  name: string;
}

interface ReactBracketsSeed {
  id: string | number;
  date: string;
  teams: [ReactBracketsTeam, ReactBracketsTeam];
  winner?: number;
}

interface ReactBracketsRound {
  title: string;
  seeds: ReactBracketsSeed[];
}

interface ReactBracketsData {
  stageId: number;
  stageName: string;
  rounds: ReactBracketsRound[];
}

const CustomSeed = ({
  seed,
  breakpoint,
  roundIndex,
  seedIndex,
}: {
  seed: ReactBracketsSeed;
  breakpoint: string;
  roundIndex: number;
  seedIndex: number;
}) => {
  return (
    <Seed mobileBreakpoint={breakpoint}>
      <SeedItem>
        <div className="match-wrapper">
          <div className="match">
            <div className="match-header">
              <div className="match-title">Match {seed.id}</div>
              <div className="match-date">
                {new Date(seed.date).toLocaleDateString()}
              </div>
            </div>
            <div className="match-participants">
              {seed.teams.map((team, idx) => (
                <div
                  key={idx}
                  className={`participant ${
                    seed.winner === team.id ? "winner" : ""
                  }`}
                >
                  <div className="participant-name">{team.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SeedItem>
    </Seed>
  );
};

/**
 * Component for displaying a tournament bracket for a specific stage
 */
const TournamentBracket = ({ stageId }: TournamentBracketProps) => {
  const [bracketData, setBracketData] = useState<ReactBracketsData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBracketData = async () => {
      try {
        setLoading(true);
        const response = await clientApi.get<ReactBracketsData>(
          `/matches/stage/${stageId}/bracket/react`
        );
        setBracketData(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    loadBracketData();
  }, [stageId]);

  if (loading) {
    return (
      <div className="bracket-loading">
        <div className="spinner"></div>
        <p>Loading bracket...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bracket-error">
        <h3>Error loading bracket</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!bracketData || bracketData.rounds.length === 0) {
    return (
      <div className="bracket-empty">
        <h3>No matches found</h3>
        <p>There are no matches available for this stage.</p>
      </div>
    );
  }

  return (
    <div className="tournament-bracket-container">
      <h2 className="bracket-title">{bracketData.stageName} Bracket</h2>
      <div className="bracket-view">
        <Bracket
          rounds={bracketData.rounds}
          renderSeed={CustomSeed}
          mobileBreakpoint={768}
          roundTitleComponent={(title: string, roundIndex: number) => (
            <div className="round-title">{title}</div>
          )}
        />
      </div>
    </div>
  );
};

export default TournamentBracket;
