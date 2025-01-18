export enum userRoleEnum {
  ADMIN = "admin",
  USER = "user",
}

export type userRoleEnumType = (typeof userRoleEnum)[keyof typeof userRoleEnum];

export type BaseResponseType = "base" | "extended" | "admin";

export enum subscriptionEnum {
  FREE = "free",
  PRO = "pro",
  PREMIUM = "premium",
}

export type subscriptionEnumType =
  (typeof subscriptionEnum)[keyof typeof subscriptionEnum];

export enum tournamentTypeEnum {
  LEAGUE = "league",
  COMPETITION = "competition",
  SEASONAL = "seasonal",
  CONTEST = "contest",
  EVENT = "event",
}

export type tournamentTypeEnumType =
  (typeof tournamentTypeEnum)[keyof typeof tournamentTypeEnum];

export enum OrganizerRoleEnum {
  OWNER = "owner",
  ADMIN = "admin",
  MODERATOR = "moderator",
}

export enum notificationTypeEnum {
  WELCOME = "welcome",
  RESET_PASSWORD = "reset-password",
  VERIFY_EMAIL = "verify-email",
  NOTIFICATION_OF_BAN = "notification-of-ban",
  BET_OUTCOME = "bet-outcome",
  TOURNAMENT_REMINDER = "tournament-reminder",
  TOURNAMENT_START = "tournament-start",
  TOURNAMENT_END = "tournament-end",
  GROUP_INVITATION = "group-invitation",
  GROUP_JOIN_REQUEST = "group-join-request",
  GROUP_JOIN_APPROVAL = "group-join-approval",
  GROUP_JOIN_REJECTION = "group-join-rejection",
  GROUP_REMOVAL = "group-removal",
  GROUP_ADMIN_PROMOTION = "group-admin-promotion",
  GROUP_ADMIN_DEMOTION = "group-admin-demotion",
  TEST = "test-template",
}
//TODO: add more types

export type OrganizerRoleEnumType =
  (typeof OrganizerRoleEnum)[keyof typeof OrganizerRoleEnum];

export enum chatRoomTypeEnum {
  TOURNAMENT = "tournament",
  DIRECT = "direct",
  GROUP = "group",
}

export type chatRoomTypeEnumType =
  (typeof chatRoomTypeEnum)[keyof typeof chatRoomTypeEnum];

export enum messageVisibilityEnum {
  PUBLIC = "public",
  ADMIN_ONLY = "admin_only",
}

export type messageVisibilityEnumType =
  (typeof messageVisibilityEnum)[keyof typeof messageVisibilityEnum];

export enum betStatusEnum {
  PENDING = "pending",
  WON = "won",
  LOST = "lost",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}
export type notificationTypeEnumType =
  (typeof notificationTypeEnum)[keyof typeof notificationTypeEnum];

export enum reportTypeEnum {
  USER = "user",
  TOURNAMENT = "tournament",
  EVENT = "event",
}

export type reportTypeEnumType =
  (typeof reportTypeEnum)[keyof typeof reportTypeEnum];

export enum reportStatusEnum {
  PENDING = "pending",
  RESOLVED = "resolved",
  REJECTED = "rejected",
}

export type reportStatusEnumType =
  (typeof reportStatusEnum)[keyof typeof reportStatusEnum];

export type groupRoleEnumType =
  (typeof groupRoleEnum)[keyof typeof groupRoleEnum];

export enum groupRoleEnum {
  OWNER = "owner",
  MEMBER = "member",
  ADMIN = "admin",
}

export type betStatusEnumType =
  (typeof betStatusEnum)[keyof typeof betStatusEnum];
export enum betTypeEnum {
  WINNER = "winner",
  POINTS = "points",
  PLACEMENT = "placement",
}

export type betTypeEnumType = (typeof betTypeEnum)[keyof typeof betTypeEnum];

export enum stageTypeEnum {
  GROUP = "group",
  KNOCKOUT = "knockout",
  SWISS = "swiss",
  ROUND_ROBIN = "round_robin",
  FIXTURE = "fixture",
  DOUBLE_ELIMINATION = "double_elimination",
  QUIZ = "quiz",
  EVALUATED_COMPETITION = "evaluated_competition",
}

export type stageTypeEnumType =
  (typeof stageTypeEnum)[keyof typeof stageTypeEnum];

export enum tournamentLocationEnum {
  ONLINE = "online",
  ONSITE = "offline",
  HYBRID = "hybrid",
}

export type tournamentLocationEnumType =
  (typeof tournamentLocationEnum)[keyof typeof tournamentLocationEnum];

export enum stageStatusEnum {
  UPCOMING = "upcoming",
  ONGOING = "ongoing",
  FINISHED = "finished",
  CANCELLED = "cancelled",
}

export type stageStatusEnumType =
  (typeof stageStatusEnum)[keyof typeof stageStatusEnum];

export enum categoryTypeEnum {
  PROGRAMMING = "programming",
  SPORTS = "sports",
  OTHER = "other",
}

export type categoryTypeEnumType =
  (typeof categoryTypeEnum)[keyof typeof categoryTypeEnum];

export enum tournamentTeamTypeEnum {
  SOLO = "solo",
  TEAM = "team",
  MIXED = "mixed",
} //TODO: decide if team type should be decided on tournament or event basis

export type matchupTypeEnumType =
  (typeof matchupTypeEnum)[keyof typeof matchupTypeEnum];

export enum likeTypeEnum {
  TOURNAMENT_POST = "tournament_post",
  RESULT_POST = "result_post",
}

export type likeTypeEnumType = (typeof likeTypeEnum)[keyof typeof likeTypeEnum];

export enum matchupTypeEnum {
  ONE_VS_ONE = "one_vs_one",
  FFA = "ffa",
}

export type tournamentTeamTypeEnumType =
  (typeof tournamentTeamTypeEnum)[keyof typeof tournamentTeamTypeEnum];

export enum tournamentPromotionTypeEnum {
  SIDE_PROMOTION = "side_promotion",
  MAIN_PROMOTION = "main_promotion",
  VIDEO_PROMOTION = "video_promotion",
  FULL_PAGE_PROMOTION = "full_page_promotion",
}

export enum quizQuestionTypeEnum {
  MULTIPLE_CHOICE = "multiple_choice",
  TRUE_FALSE = "true_false",
  SHORT_ANSWER = "short_answer",
}

export type quizQuestionTypeEnumType =
  (typeof quizQuestionTypeEnum)[keyof typeof quizQuestionTypeEnum];

export enum submissionStatusEnum {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  WRONG_ANSWER = "wrong_answer",
  COMPILE_ERROR = "compile_error",
  RUNTIME_ERROR = "runtime_error",
  TIME_LIMIT_EXCEEDED = "time_limit_exceeded",
  MEMORY_LIMIT_EXCEEDED = "memory_limit_exceeded",
}

export enum groupTypeEnum {
  PRIVATE = "private",
  PUBLIC = "public",
  FAKE = "fake",
}

export type groupTypeEnumType =
  (typeof groupTypeEnum)[keyof typeof groupTypeEnum];

export type tournamentPromotionTypeEnumType =
  (typeof tournamentPromotionTypeEnum)[keyof typeof tournamentPromotionTypeEnum];

export enum participationStatusEnum {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  WITHDRAWN = "withdrawn",
  DISQUALIFIED = "disqualified",
  COMPLETED = "completed",
}

export type participationStatusEnumType =
  (typeof participationStatusEnum)[keyof typeof participationStatusEnum];

export enum groupFocusEnum {
  PARTICIPATION = "participation",
  ORGANIZATION = "organization",
  HYBRID = "hybrid",
}

export type groupFocusEnumType =
  (typeof groupFocusEnum)[keyof typeof groupFocusEnum];

export enum pointConversionTypeEnum {
  STAGE_TO_STAGE = "stage_to_stage",
  STAGE_TO_TOURNAMENT = "stage_to_tournament",
  TOURNAMENT_TO_TOURNAMENT = "tournament_to_tournament",
}

export type pointConversionTypeEnumType =
  (typeof pointConversionTypeEnum)[keyof typeof pointConversionTypeEnum];

export enum pointConversionStrategyEnum {
  QUALIFICATION = "qualification",
  RANKING = "ranking",
  ELIMINATION = "elimination", // eliminate teams under certain point threshold
  HYBRID = "hybrid",
  SEED = "seed",
  TIE_BREAKER = "tie_breaker",
  QUALIFICATION_WITH_LCQ = "qualification_with_lcq",

  // TODO: add more if needed
}

export type pointConversionStrategyEnumType =
  (typeof pointConversionStrategyEnum)[keyof typeof pointConversionStrategyEnum];

export const exportEnumValues = (
  enumToExport: object
): [string, ...string[]] => {
  const values = Object.values(enumToExport);
  if (!values.length) {
    throw new Error("No values found in enum");
  }
  return values as [string, ...string[]];
};
