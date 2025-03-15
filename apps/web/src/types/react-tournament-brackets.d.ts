declare module "@g-loot/react-tournament-brackets" {
  import React from "react";

  export interface Participant {
    id: string;
    name: string;
    status?: string | null;
    resultText?: string | null;
    isWinner?: boolean;
    [key: string]: any;
  }

  export interface Match {
    id: string;
    name: string;
    nextMatchId: string | undefined;
    tournamentRoundText: string;
    startTime: string;
    state: "SCHEDULED" | "ACTIVE" | "DONE";
    participants: Participant[];
    [key: string]: any;
  }

  export interface MatchComponentProps {
    match: Match;
    onMatchClick?: (match: Match) => void;
    onParticipantClick?: (participant: Participant, isWinner: boolean) => void;
    onMouseEnter?: (participant: Participant, isWinner: boolean) => void;
    onMouseLeave?: (participant: Participant, isWinner: boolean) => void;
    topParticipant: Participant | null;
    bottomParticipant: Participant | null;
    topWon: boolean;
    bottomWon: boolean;
    topHovered: boolean;
    bottomHovered: boolean;
    topText: string | null;
    bottomText: string | null;
    [key: string]: any;
  }

  export interface SingleEliminationBracketProps {
    matches: Match[];
    matchComponent?: React.ComponentType<MatchComponentProps>;
    svgWrapper?: React.ComponentType<SVGViewerProps>;
    [key: string]: any;
  }

  export interface SVGViewerProps {
    width: number;
    height: number;
    className?: string;
    children: React.ReactNode;
    [key: string]: any;
  }

  export const SingleEliminationBracket: React.FC<SingleEliminationBracketProps>;
  export const SVGViewer: React.FC<SVGViewerProps>;
}
