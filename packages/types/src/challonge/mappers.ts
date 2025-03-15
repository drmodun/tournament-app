import { stageTypeEnum, stageStatusEnum } from "../enums";
import { TournamentType, TournamentState, MatchState } from "./index";
import {
  IChallongeTournament,
  IChallongeParticipant,
  IChallongeMatch,
} from "./responses.dto";
import {
  ICreateChallongeTournamentRequest,
  ICreateChallongeParticipantRequest,
  IMatchScoreRequest,
  IUpdateChallongeTournamentRequest,
  IUpdateParticipantRequest,
  ITournamentStateRequest,
} from "./requests.dto";

// Stage type to Challonge tournament type mapping
export const stageTypeToChallongeType: Record<stageTypeEnum, TournamentType> = {
  group: "single_elimination",
  double_elimination: "double_elimination",
  round_robin: "round_robin",
  swiss: "swiss",
  compass: "double_elimination",
  knockout: "single_elimination",
  fixture: "round_robin",
  quiz: "round_robin",
  evaluated_competition: "double_elimination",
  triple_elimination: "double_elimination", // TODO: when we replace challonge or improve upon the current system we can use more types
};

// Stage status to Challonge tournament state mapping
export const stageStatusToChallongeState: Record<
  stageStatusEnum,
  TournamentState
> = {
  upcoming: "pending",
  ongoing: "in_progress",
  finished: "ended",
  cancelled: "ended",
};

// Convert Stage to Challonge Tournament
export function stageToChallongeTournament(stage: {
  id: number;
  name: string;
  description?: string;
  stageType: stageTypeEnum;
  stageStatus: stageStatusEnum;
  startDate: Date;
  endDate?: Date;
}): Omit<IChallongeTournament, "id"> {
  return {
    type: "tournament",
    attributes: {
      name: stage.name,
      url: `stage-${stage.id}`,
      tournament_type: stageTypeToChallongeType[stage.stageType],
      state: stageStatusToChallongeState[stage.stageStatus],
      description: stage.description,
      private: true,
      timestamps: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        starts_at: stage.startDate.toISOString(),
        completed_at: stage.endDate?.toISOString(),
      },
    },
  };
}

// Convert Stage to Challonge Tournament Create Request
export function stageToCreateTournamentRequest(stage: {
  id: number;
  name: string;
  description?: string;
  stageType: stageTypeEnum;
  startDate: Date;
}): ICreateChallongeTournamentRequest {
  return {
    data: {
      type: "tournament",
      attributes: {
        name: stage.name,
        url: `stage-${stage.id}`,
        tournament_type: stageTypeToChallongeType[stage.stageType],
        description: stage.description,
        private: true,
        starts_at: stage.startDate.toISOString(),
      },
    },
  };
}

// Convert Stage to Challonge Tournament Update Request
export function stageToUpdateTournamentRequest(stage: {
  id: number;
  name: string;
  description?: string;
  stageType: stageTypeEnum;
  startDate: Date;
}): IUpdateChallongeTournamentRequest {
  return stageToCreateTournamentRequest(stage);
}

// Convert Stage Status to Tournament State Request
export function stageStatusToTournamentStateRequest(
  status: stageStatusEnum,
): ITournamentStateRequest {
  const stateMap: Record<
    stageStatusEnum,
    ITournamentStateRequest["data"]["attributes"]["state"]
  > = {
    upcoming: "start",
    ongoing: "start",
    finished: "finalize",
    cancelled: "reset",
  };

  return {
    data: {
      type: "TournamentState",
      attributes: {
        state: stateMap[status],
      },
    },
  };
}

// Convert Roster to Challonge Participant
export function rosterToChallongeParticipant(roster: {
  id: number;
  participationId: number;
  points: number;
  challongeParticipantId?: string;
  participation: {
    groupId?: number;
    userId?: number;
  };
}): Omit<IChallongeParticipant, "id"> {
  return {
    type: "participant",
    attributes: {
      name: `Roster-${roster.id}`,
      seed: 0, // You might want to calculate this based on points or other criteria
      group_id: roster.participation.groupId,
      tournament_id: roster.participationId,
      final_rank: undefined,
      states: {
        active: true,
      },
      timestamps: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
  };
}

// Convert Roster to Challonge Participant Create Request
export function rosterToCreateParticipantRequest(roster: {
  id: number;
}): ICreateChallongeParticipantRequest {
  return {
    data: {
      type: "participant",
      attributes: {
        name: `Roster-${roster.id}`,
        misc: JSON.stringify({
          rosterId: roster.id,
        }),
      },
    },
  };
}

// Convert Roster to Challonge Participant Update Request
export function rosterToUpdateParticipantRequest(roster: {
  id: number;
}): IUpdateParticipantRequest {
  return rosterToCreateParticipantRequest(roster);
}

// Convert Matchup to Challonge Match
export function matchupToChallongeMatch(matchup: {
  id: number;
  stageId: number;
  roundId: number;
  matchupType: string;
  startDate: Date;
  endDate?: Date;
  isFinished: boolean;
  rosterToMatchup?: Array<{
    rosterId: number;
    isWinner: boolean;
  }>;
}): Omit<IChallongeMatch, "id"> {
  const state: MatchState = matchup.isFinished ? "complete" : "pending";

  return {
    type: "match",
    attributes: {
      state,
      round: matchup.roundId,
      identifier: `Match-${matchup.id}`,
      suggested_play_order: 0,
      scores: "", // You'll need to implement score conversion logic
      score_in_sets: [],
      points_by_participant: [],
      timestamps: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        starts_at: matchup.startDate.toISOString(),
        completed_at: matchup.endDate?.toISOString(),
      },
      winner_id: matchup.rosterToMatchup?.find((r) => r.isWinner)?.rosterId,
      relationships: {
        player1: {
          data: {
            id: matchup.rosterToMatchup?.[0]?.rosterId.toString() || "",
            type: "participant",
          },
        },
        player2: {
          data: {
            id: matchup.rosterToMatchup?.[1]?.rosterId.toString() || "",
            type: "participant",
          },
        },
      },
    },
  };
}

// Convert Challonge Tournament to Stage
export function challongeTournamentToStage(tournament: IChallongeTournament): {
  name: string;
  description?: string;
  stageType: stageTypeEnum;
  stageStatus: stageStatusEnum;
  startDate: Date;
  endDate?: Date;
} {
  const stageType =
    (Object.entries(stageTypeToChallongeType).find(
      ([_, challongeType]) =>
        challongeType === tournament.attributes.tournament_type,
    )?.[0] as stageTypeEnum) || "group";

  const stageStatus =
    (Object.entries(stageStatusToChallongeState).find(
      ([_, challongeState]) => challongeState === tournament.attributes.state,
    )?.[0] as stageStatusEnum) || "upcoming";

  return {
    name: tournament.attributes.name,
    description: tournament.attributes.description,
    stageType: stageType as stageTypeEnum,
    stageStatus: stageStatus as stageStatusEnum,
    startDate: tournament.attributes.timestamps.starts_at
      ? new Date(tournament.attributes.timestamps.starts_at)
      : new Date(),
    endDate: tournament.attributes.timestamps.completed_at
      ? new Date(tournament.attributes.timestamps.completed_at)
      : undefined,
  };
}

// Convert Challonge Participant to Roster
export function challongeParticipantToRoster(
  participant: IChallongeParticipant,
): {
  challongeParticipantId: string;
  points: number;
} {
  return {
    challongeParticipantId: participant.id,
    points: 0, // You might want to calculate this based on final_rank or other attributes
  };
}

// Convert Challonge Match to Matchup
export function challongeMatchToMatchup(match: IChallongeMatch): {
  isFinished: boolean;
  startDate: Date;
  endDate?: Date;
  rosterToMatchup: Array<{
    rosterId: number;
    isWinner: boolean;
  }>;
} {
  return {
    isFinished: match.attributes.state === "complete",
    startDate: match.attributes.timestamps.starts_at
      ? new Date(match.attributes.timestamps.starts_at)
      : new Date(),
    endDate: match.attributes.timestamps.completed_at
      ? new Date(match.attributes.timestamps.completed_at)
      : undefined,
    rosterToMatchup: [
      {
        rosterId: parseInt(match.attributes.relationships.player1.data.id),
        isWinner:
          match.attributes.winner_id ===
          parseInt(match.attributes.relationships.player1.data.id),
      },
      {
        rosterId: parseInt(match.attributes.relationships.player2.data.id),
        isWinner:
          match.attributes.winner_id ===
          parseInt(match.attributes.relationships.player2.data.id),
      },
    ],
  };
}

// Convert Match Score to Challonge Match Score Request
export function matchScoreToChallongeScoreRequest(matchScore: {
  rosterScores: Array<{
    rosterId: number;
    score: string;
    isWinner: boolean;
  }>;
}): IMatchScoreRequest {
  return {
    data: {
      type: "match",
      attributes: {
        match: matchScore.rosterScores.map((score) => ({
          participant_id: score.rosterId.toString(),
          score_set: score.score,
          advancing: score.isWinner,
        })),
      },
    },
  };
}
