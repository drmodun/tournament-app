import {
  TournamentType,
  TournamentState,
  MatchState,
  ITimestamps,
  IMatchPoints,
  IRelationship,
  ILinks,
} from "./index";

export interface IChallongeTournament {
  id: string;
  type: "tournament";
  attributes: {
    name: string;
    url: string;
    tournament_type: TournamentType;
    state: TournamentState;
    game_name?: string;
    private: boolean;
    description?: string;
    starts_at?: string;
  };
}

export interface IChallongeParticipant {
  id: string;
  type: "participant";
  attributes: {
    name: string;
    seed: number;
    group_id?: number;
    tournament_id: number;
    username?: string;
    final_rank?: number;
    states: {
      active: boolean;
    };
    misc?: string;
    timestamps: ITimestamps;
  };
}

export interface IChallongeMatch {
  id: string;
  type: "match";
  attributes: {
    state: MatchState;
    round: number;
    identifier: string;
    suggestedPlayOrder: number;
    scores: string;
    scoreInSets: number[][];
    pointsByParticipant: IMatchPoints[];
    timestamps: ITimestamps;
  };
  winnerId?: number;
  relationships: {
    player1: IRelationship;
    player2: IRelationship;
  };
}

export interface IChallongeMatchAttachment {
  id: string;
  type: "match_attachment";
  attributes: {
    id: number;
    url: string;
    description: string;
    timestamps: ITimestamps;
  };
}

export interface IChallongeUser {
  id: string;
  type: "user";
  attributes: {
    email: string;
    username: string;
    image_url?: string;
  };
}

export interface IChallongeCommunity {
  id: string;
  type: "community";
  attributes: {
    permalink: string;
    subdomain: string;
    identifier: string;
    name: string;
    description: string;
    timestamps: ITimestamps;
  };
}

export interface IChallongeRound {
  id: string;
  type: "round";
  attributes: {
    round: number;
    state: "pending" | "underway" | "completed";
    timestamps: ITimestamps;
  };
  relationships: {
    participants: {
      links: {
        related: string;
        meta: {
          count: number;
        };
      };
    };
    elapsedTimes: {
      links: {
        related: string;
        meta: {
          count: number;
        };
      };
    };
  };
  links: ILinks;
}

export interface IChallongeElapsedTime {
  id: string;
  type: "elapsed_time";
  attributes: {
    elapsedTime: number;
    points: number;
    rank?: number;
    formattedTime: string;
    timestamps: ITimestamps;
  };
  relationships: {
    participant: IRelationship;
  };
  links: ILinks;
}

export interface IChallongeRace {
  id: string;
  type: "race";
  attributes: {
    name: string;
    url: string;
    raceType: "time trial" | "grand prix";
    description?: string;
    private?: boolean;
    currentLap: {
      id: number;
      number: number;
    };
    timestamps: ITimestamps;
  };
  relationships: {
    rounds: {
      links: {
        related: string;
        meta: {
          count: number;
        };
      };
    };
    participants: {
      links: {
        related: string;
        meta: {
          count: number;
        };
      };
    };
  };
  links: ILinks;
}
