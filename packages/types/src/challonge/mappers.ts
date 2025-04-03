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
  IBulkCreateChallongeParticipantRequest,
  IParticipantDetails,
} from "./requests.dto";
import { IRosterInfoToCreateChallongeParticipant } from "src/roster/responses.dto";

export const stageTypeToChallongeType: Record<stageTypeEnum, TournamentType> = {
  group: "single elimination",
  double_elimination: "double elimination",
  round_robin: "round robin",
  swiss: "swiss",
  compass: "double elimination",
  knockout: "single elimination",
  fixture: "round robin",
  quiz: "round robin",
  evaluated_competition: "double elimination",
  triple_elimination: "double elimination",
};

export const stageStatusToChallongeState: Record<
  stageStatusEnum,
  TournamentState
> = {
  upcoming: "pending",
  ongoing: "in_progress",
  finished: "ended",
  cancelled: "ended",
};

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
      name: sanitizeForChallonge(stage.name),
      url: `winning_stage_${stage.id}`,
      tournament_type: stageTypeToChallongeType[stage.stageType],
      state: stageStatusToChallongeState[stage.stageStatus],
      description: stage.description
        ? sanitizeForChallonge(stage.description)
        : undefined,
      private: true,
      starts_at: formatDateForChallonge(stage.startDate),
    },
  };
}

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
        name: sanitizeForChallonge(stage.name),
        url: `winning_stage_${stage.id}`,
        tournament_type: stageTypeToChallongeType[stage.stageType],
        description: stage.description
          ? sanitizeForChallonge(stage.description)
          : undefined,
        private: true,
        starts_at: formatDateForChallonge(stage.startDate),
      },
    },
  };
}

function sanitizeForChallonge(str: string): string {
  if (!str) return str;
  return str
    .replace(/-/g, "_")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/\./g, " ");
}

function formatDateForChallonge(date: Date): string {
  if (!date) return null;
  return date.toLocaleTimeString();
}

export function stageToUpdateTournamentRequest(stage: {
  id: number;
  name: string;
  description?: string;
  stageType: stageTypeEnum;
  startDate: Date;
}): IUpdateChallongeTournamentRequest {
  return {
    data: {
      type: "tournament",
      attributes: {
        name: sanitizeForChallonge(stage.name),
        url: `winning_stage_${stage.id}`,
        tournament_type: stageTypeToChallongeType[stage.stageType],
        description: stage.description
          ? sanitizeForChallonge(stage.description)
          : undefined,
        private: true,
        starts_at: formatDateForChallonge(stage.startDate),
      },
    },
  };
}

export function stageStatusToTournamentStateRequest(
  status: stageStatusEnum
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
      seed: 0, // TODO:
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

export function rosterToBulkCreateParticipantRequest(
  rosters: IRosterInfoToCreateChallongeParticipant[]
): IBulkCreateChallongeParticipantRequest {
  const rostersWithUniqueNames = checkAndHandleDuplicateChallongeTeams(rosters);

  return {
    data: {
      type: "Participants",
      attributes: {
        participants: rostersWithUniqueNames.map(rosterToParticipantDetails),
      },
    },
  };
}

export function checkAndHandleDuplicateChallongeTeams(
  rosters: IRosterInfoToCreateChallongeParticipant[]
): IRosterInfoToCreateChallongeParticipant[] {
  for (const roster of rosters) {
    const duplicateRoster = rosters.find((r) => r.name === roster.name);
    if (duplicateRoster) {
      roster.name = `${roster.name}-${duplicateRoster.id}`;
    }
  }

  return rosters;
}

function rosterToParticipantDetails(
  roster: IRosterInfoToCreateChallongeParticipant
): IParticipantDetails {
  return {
    name: sanitizeForChallonge(roster.name),
    //TODO: add seed
  };
}

export function rosterToCreateParticipantRequest(roster: {
  id: number;
  participationId: number;
  name: string;
}): ICreateChallongeParticipantRequest {
  return {
    data: {
      type: "participant",
      attributes: rosterToParticipantDetails(roster),
    },
  };
}

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
      scores: "",
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
        challongeType === tournament.attributes.tournament_type
    )?.[0] as stageTypeEnum) || "group";

  const stageStatus =
    (Object.entries(stageStatusToChallongeState).find(
      ([_, challongeState]) => challongeState === tournament.attributes.state
    )?.[0] as stageStatusEnum) || "upcoming";

  return {
    name: tournament.attributes.name,
    description: tournament.attributes.description,
    stageType: stageType as stageTypeEnum,
    stageStatus: stageStatus as stageStatusEnum,
    startDate: new Date(tournament.attributes.starts_at),
  };
}

export function challongeParticipantToRoster(
  participant: IChallongeParticipant
): {
  challongeParticipantId: string;
  points: number;
} {
  return {
    challongeParticipantId: participant.id,
    points: 0,
  };
}

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
