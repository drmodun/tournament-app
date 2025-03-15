import {
  SingleEliminationBracket,
  Match,
  SVGViewer,
} from "@g-loot/react-tournament-brackets";
import React from "react";
/**
 * Interface for the bracket data response from the API
 */
export interface BracketParticipant {
  id: number;
  name: string;
  logo?: string;
  isWinner: boolean;
  resultText?: string;
  status?: string;
  wins: number;
}

export interface BracketMatch {
  id: string;
  name: string;
  nextMatchId?: string;
  tournamentRoundText: string;
  startTime: string;
  state: "SCHEDULED" | "ACTIVE" | "DONE";
  participants: BracketParticipant[];
}

export interface BracketData {
  stageId: number;
  stageName: string;
  stageType: string;
  tournamentId: number;
  matches: BracketMatch[];
}

/**
 * Transforms the API bracket data to the format required by @g-loot/react-tournament-brackets
 * @param bracketData The bracket data from the API
 * @returns The transformed data for the bracket visualization
 */
export const transformBracketData = (bracketData: BracketData): Match[] => {
  return bracketData?.matches?.map((match) => ({
    id: match.id,
    name: match.name,
    nextMatchId: match.nextMatchId,
    tournamentRoundText: match.tournamentRoundText,
    startTime: match.startTime,
    state: match.state,
    participants: match.participants.map((participant) => ({
      id: participant.id.toString(),
      name: participant.name,
      isWinner: participant.isWinner,
      status: participant.status || undefined,
      resultText: participant.resultText || undefined,
    })),
  }));
};

/**
 * Component for rendering a single elimination bracket
 * @param matches The matches data
 * @param options Optional configuration options
 * @returns JSX element
 */
export const renderSingleEliminationBracket = (
  matches: Match[],
  options: {
    width?: number;
    height?: number;
    svgWrapperClassName?: string;
  } = {},
) => {
  const {
    width = 1000,
    height = 500,
    svgWrapperClassName = "bracket-wrapper",
  } = options;

  return (
    <SingleEliminationBracket
      matches={matches}
      matchComponent={({
        match,
        onMatchClick,
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
      }) => (
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
                  onParticipantClick &&
                  topParticipant &&
                  onParticipantClick(topParticipant, topWon)
                }
                onMouseEnter={() =>
                  onMouseEnter &&
                  topParticipant &&
                  onMouseEnter(topParticipant, topWon)
                }
                onMouseLeave={() =>
                  onMouseLeave &&
                  topParticipant &&
                  onMouseLeave(topParticipant, topWon)
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
                  onParticipantClick &&
                  bottomParticipant &&
                  onParticipantClick(bottomParticipant, bottomWon)
                }
                onMouseEnter={() =>
                  onMouseEnter &&
                  bottomParticipant &&
                  onMouseEnter(bottomParticipant, bottomWon)
                }
                onMouseLeave={() =>
                  onMouseLeave &&
                  bottomParticipant &&
                  onMouseLeave(bottomParticipant, bottomWon)
                }
              >
                <div className="participant-name">
                  {bottomParticipant?.name || "TBD"}
                </div>
                {bottomText && (
                  <div className="participant-score">{bottomText}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      svgWrapper={({ children, ...props }) => (
        <SVGViewer className={svgWrapperClassName} {...props}>
          {children}
        </SVGViewer>
      )}
    />
  );
};

/**
 * Fetches bracket data from the API
 * @param stageId The ID of the stage to fetch bracket data for
 * @returns The bracket data
 */
export const fetchBracketData = async (
  stageId: number,
): Promise<BracketData> => {
  const response = await fetch(`/api/matches/stage/${stageId}/bracket`);
  if (!response.ok) {
    throw new Error(`Failed to fetch bracket data: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Example usage in a React component:
 *
 * ```tsx
 * import { useEffect, useState } from 'react';
 * import { fetchBracketData, transformBracketData, renderSingleEliminationBracket } from '../utils/bracketUtils';
 *
 * const BracketView = ({ stageId }) => {
 *   const [matches, setMatches] = useState([]);
 *   const [loading, setLoading] = useState(true);
 *   const [error, setError] = useState(null);
 *
 *   useEffect(() => {
 *     const loadBracketData = async () => {
 *       try {
 *         setLoading(true);
 *         const data = await fetchBracketData(stageId);
 *         const transformedMatches = transformBracketData(data);
 *         setMatches(transformedMatches);
 *       } catch (err) {
 *         setError(err.message);
 *       } finally {
 *         setLoading(false);
 *       }
 *     };
 *
 *     loadBracketData();
 *   }, [stageId]);
 *
 *   if (loading) return <div>Loading bracket...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return renderSingleEliminationBracket(matches);
 * };
 *
 * export default BracketView;
 * ```
 */
