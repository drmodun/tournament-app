import { useEffect, useState } from "react";
import {
  Match,
  SingleEliminationBracket,
  SVGViewer,
  Participant,
  MatchComponentProps,
  SVGViewerProps,
} from "@g-loot/react-tournament-brackets";
import "../styles/bracket.css";
import axios from "axios";
import {
  BracketData,
  BracketMatch,
  BracketParticipant,
  transformBracketData,
} from "../utils/bracketUtils";
import { clientApi } from "api/client/base";

interface TournamentBracketProps {
  stageId: number;
  width?: number;
  height?: number;
}

const MatchComponent = ({
  match,
  onParticipantClick,
  onMouseEnter,
  onMouseLeave,
  topParticipant,
  bottomParticipant,
  topWon,
  bottomWon,
  topHovered,
  bottomHovered,
  topText,
  bottomText,
}: MatchComponentProps) => (
  <div className="match-wrapper">
    <div className="match">
      <div className="match-header">
        <div className="match-title">{match.name}</div>
        <div className="match-status">{match.state}</div>
      </div>
      <div className="match-participants">
        <div
          className={`participant ${topWon ? "winner" : ""} ${topHovered ? "hovered" : ""}`}
          onClick={() =>
            topParticipant && onParticipantClick?.(topParticipant, topWon)
          }
          onMouseEnter={() =>
            topParticipant && onMouseEnter?.(topParticipant, topWon)
          }
          onMouseLeave={() =>
            topParticipant && onMouseLeave?.(topParticipant, topWon)
          }
        >
          <div className="participant-name">
            {topParticipant?.name || "TBD"}
          </div>
          {topText && <div className="participant-score">{topText}</div>}
        </div>
        <div
          className={`participant ${bottomWon ? "winner" : ""} ${bottomHovered ? "hovered" : ""}`}
          onClick={() =>
            bottomParticipant &&
            onParticipantClick?.(bottomParticipant, bottomWon)
          }
          onMouseEnter={() =>
            bottomParticipant && onMouseEnter?.(bottomParticipant, bottomWon)
          }
          onMouseLeave={() =>
            bottomParticipant && onMouseLeave?.(bottomParticipant, bottomWon)
          }
        >
          <div className="participant-name">
            {bottomParticipant?.name || "TBD"}
          </div>
          {bottomText && <div className="participant-score">{bottomText}</div>}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Component for displaying a tournament bracket for a specific stage
 */
const TournamentBracket = ({
  stageId,
  width = 1000,
  height = 500,
}: TournamentBracketProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stageName, setStageName] = useState<string>("");

  useEffect(() => {
    const loadBracketData = async () => {
      try {
        setLoading(true);
        const response = await clientApi.get<BracketData>(
          `/matches/stage/${stageId}/bracket`
        );
        const data = response.data;
        const transformedMatches = transformBracketData(data);
        setMatches(transformedMatches);
        setStageName(data.stageName);
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

  if (matches.length === 0) {
    return (
      <div className="bracket-empty">
        <h3>No matches found</h3>
        <p>There are no matches available for this stage.</p>
      </div>
    );
  }

  return (
    <div className="tournament-bracket-container">
      <h2 className="bracket-title">{stageName} Bracket</h2>
      <div className="bracket-view">
        <SingleEliminationBracket
          matches={matches}
          matchComponent={MatchComponent}
          svgWrapper={({ children, width, height, ...props }) => (
            <SVGViewer
              className="bracket-wrapper"
              width={1000}
              height={1000}
              {...props}
            >
              {children}
            </SVGViewer>
          )}
        />
      </div>
    </div>
  );
};

export default TournamentBracket;
