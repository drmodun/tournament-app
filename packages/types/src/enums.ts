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
  INFO = "info",
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
}

export type betStatusEnumType =
  (typeof betStatusEnum)[keyof typeof betStatusEnum];
export enum betTypeEnum {
  WINNER = "winner",
  POINTS = "points",
  PLACEMENT = "placement",
}

export type betTypeEnumType = (typeof betTypeEnum)[keyof typeof betTypeEnum];

export enum typeOfEvent {
  GROUP = "group",
  KNOCKOUT = "knockout",
  SWISS = "swiss",
  ROUND_ROBIN = "round_robin",
  FIXTURE = "fixture",
  DOUBLE_ELIMINATION = "double_elimination",
  QUIZ = "quiz",
  EVALUATED_COMPETITION = "evaluated_competition",
}

export type typeOfEventType = (typeof typeOfEvent)[keyof typeof typeOfEvent];

export enum tournamentLocationEnum {
  ONLINE = "online",
  ONSITE = "offline",
  HYBRID = "hybrid",
}

export type tournamentLocationEnumType =
  (typeof tournamentLocationEnum)[keyof typeof tournamentLocationEnum];

export enum eventStatusEnum {
  UPCOMING = "upcoming",
  ONGOING = "ongoing",
  FINISHED = "finished",
  CANCELLED = "cancelled",
}

export type eventStatusEnumType =
  (typeof eventStatusEnum)[keyof typeof eventStatusEnum];

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

export const exportEnumValues = (
  enumToExport: object
): [string, ...string[]] => {
  const values = Object.values(enumToExport);
  if (!values.length) {
    throw new Error("No values found in enum");
  }
  return values as [string, ...string[]];
};
