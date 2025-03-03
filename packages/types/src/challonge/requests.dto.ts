import {
  TournamentType,
  INotificationOptions,
  IRegistrationOptions,
  ISeedingOptions,
  IStationOptions,
  IGroupStageOptions,
  IDoubleEliminationOptions,
  IRoundRobinOptions,
  ISwissOptions,
  IFreeForAllOptions,
} from "./index";

export interface ICreateChallongeTournamentRequest {
  data: {
    type: "tournament";
    attributes: {
      name: string;
      url?: string;
      tournament_type: TournamentType;
      game_name?: string;
      private?: boolean;
      starts_at?: string;
      description?: string;
      notifications?: INotificationOptions;
      match_options?: {
        consolation_matches_target_rank?: number;
        accept_attachments?: boolean;
      };
      registration_options?: IRegistrationOptions;
      seeding_options?: ISeedingOptions;
      station_options?: IStationOptions;
      group_stage_enabled?: boolean;
      group_stage_options?: IGroupStageOptions;
      double_elimination_options?: IDoubleEliminationOptions;
      round_robin_options?: IRoundRobinOptions;
      swiss_options?: ISwissOptions;
      free_for_all_options?: IFreeForAllOptions;
    };
  };
}

export interface IUpdateChallongeTournamentRequest
  extends ICreateChallongeTournamentRequest {}

export interface ITournamentStateRequest {
  data: {
    type: "TournamentState";
    attributes: {
      state:
        | "process_checkin"
        | "abort_checkin"
        | "start_group_stage"
        | "finalize_group_stage"
        | "reset_group_stage"
        | "start"
        | "finalize"
        | "reset"
        | "open_predictions";
    };
  };
}

export interface ICreateChallongeParticipantRequest {
  data: {
    type: "participant";
    attributes: {
      name: string;
      seed?: number;
      misc?: string;
      email?: string;
      username?: string;
    };
  };
}

export interface IUpdateParticipantRequest
  extends ICreateChallongeParticipantRequest {}

export interface IBulkCreateParticipantsRequest {
  data: {
    type: "participant";
    attributes: {
      participants: Array<{
        name: string;
        seed?: number;
        misc?: string;
        email?: string;
        username?: string;
      }>;
    };
  };
}

export interface IMatchScoreRequest {
  data: {
    type: "match";
    attributes: {
      match: Array<{
        participant_id: string;
        score_set: string;
        rank?: number;
        advancing?: boolean;
      }>;
      tie?: boolean;
    };
  };
}

export interface IMatchStateRequest {
  data: {
    type: "MatchState";
    attributes: {
      state: "reopen" | "mark_as_underway" | "unmark_as_underway";
    };
  };
}

export interface ICreateMatchAttachmentRequest {
  data: {
    type: "match_attachment";
    attributes: {
      url: string;
      description: string;
      asset?: Record<string, unknown>;
    };
  };
}

export interface IElapsedTimeRequest {
  data: {
    type: "ElapsedTime";
    attributes: {
      elapsedTime: number;
      points: number;
      rank?: number;
    };
  };
}

export interface IBulkElapsedTimeRequest {
  data: {
    type: "BulkElapsedTime";
    attributes: {
      elapsed_times: Array<{
        elapsedTimeId: number;
        time: number;
        points: number;
        rank?: number;
      }>;
    };
  };
}

export interface IRoundStateRequest {
  data: {
    type: "RoundState";
    attributes: {
      state: "start" | "finalize" | "reset";
    };
  };
}

export interface IRacingRequest {
  data: {
    type: "Race";
    attributes: {
      name: string;
      url: string;
      raceType: "time trial" | "grand prix";
      description?: string;
      private?: boolean;
      startsAt?: string;
      notifications?: INotificationOptions;
      registrationOptions?: IRegistrationOptions;
      grandPrixOptions?: {
        rounds: number;
      };
    };
  };
}

export interface IRacingStateRequest {
  data: {
    type: "RaceState";
    attributes: {
      state: "start" | "reset" | "end_round";
    };
  };
}
