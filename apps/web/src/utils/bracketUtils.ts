import {
  SingleEliminationBracket,
  Match,
  Participant,
  SVGViewer,
} from "@g-loot/react-tournament-brackets";

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
  state: 'SCHEDULED' | 'ACTIVE' | 'DONE';
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
  return bracketData.matches.map((match) => ({
    id: match.id,
    name: match.name,
    nextMatchId: match.nextMatchId || null,
    tournamentRoundText: match.tournamentRoundText,
    startTime: match.startTime,
    state: match.state,
    participants: match.participants.map((participant) => ({
      id: participant.id.toString(),
      name: participant.name,
      isWinner: participant.isWinner,
      status: participant.status || null,
      resultText: participant.resultText || null,
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
  } = {}
) => {
  const { width = 1000, height = 500, svgWrapperClassName = 'bracket-wrapper' } = options;

  return (
    <SingleEliminationBracket
      matches={matches}
      matchComponent={({ match, onMatchClick, onParticipantClick, onMouseEnter, onMouseLeave, topParticipant, bottomParticipant, topWon, bottomWon, topHovered, bottomHovered, topText, bottomText }) => (
        <div className="match-wrapper">
          <div className="match">
            <div className="match-header">
              <div className="match-title">{match.name}</div>
              <div className="match-status">{match.state}</div>
            </div>
            <div className="match-participants">
              <div 
                className={`participant ${topWon ? 'winner' : ''} ${topHovered ? 'hovered' : ''}`}
                onClick={() => onParticipantClick?.(topParticipant, topWon)}
                onMouseEnter={() => onMouseEnter?.(topParticipant, topWon)}
                onMouseLeave={() => onMouseLeave?.(topParticipant, topWon)}
              >
                <div className="participant-name">{topParticipant?.name || 'TBD'}</div>
                {topText && <div className="participant-score">{topText}</div>}
              </div>
              <div 
                className={`participant ${bottomWon ? 'winner' : ''} ${bottomHovered ? 'hovered' : ''}`}
                onClick={() => onParticipantClick?.(bottomParticipant, bottomWon)}
                onMouseEnter={() => onMouseEnter?.(bottomParticipant, bottomWon)}
                onMouseLeave={() => onMouseLeave?.(bottomParticipant, bottomWon)}
              >
                <div className="participant-name">{bottomParticipant?.name || 'TBD'}</div>
                {bottomText && <div className="participant-score">{bottomText}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
      svgWrapper={({ children, ...props }) => (
        <SVGViewer width={width} height={height} className={svgWrapperClassName} {...props}>
          {children}
        </SVGViewer>
      )}
    />
  );
};
