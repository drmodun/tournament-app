import { useEffect, useState } from "react";
import { Bracket, Seed, SeedItem } from "react-brackets";
import "../styles/bracket.css";
import { clientApi } from "api/client/base";

interface TournamentBracketProps {
  stageId: number;
}

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

interface ReactBracketsData {
  stageId: number;
  stageName: string;
  rounds: ReactBracketsRound[];
}

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

        // Transform the data to format dates and add scores
        const formattedData: ReactBracketsData = {
          ...response.data,
          rounds: response.data.rounds.map((round, roundIndex) => ({
            title:
              roundIndex === 0
                ? "First Round"
                : roundIndex === response.data.rounds.length - 1
                  ? "Finals"
                  : roundIndex === response.data.rounds.length - 2
                    ? "Semi Finals"
                    : roundIndex === response.data.rounds.length - 3
                      ? "Quarter Finals"
                      : `Round ${roundIndex + 1}`,
            seeds: round.seeds.map((seed) => ({
              ...seed,
              date: new Date(seed.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              }),
              teams: [
                seed.teams[0] || { name: "TBD" },
                seed.teams[1] || { name: "TBD" },
              ] as [ReactBracketsTeam, ReactBracketsTeam],
            })),
          })),
        };

        setBracketData(formattedData);
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
      <h2 className="bracket-title">{bracketData.stageName}</h2>
      <div className="bracket-view">
        <Bracket
          rounds={bracketData.rounds}
          mobileBreakpoint={768}
          swipeableProps={{
            enableMouseEvents: true,
            animateHeight: true,
          }}
        />
      </div>
    </div>
  );
};

export default TournamentBracket;
