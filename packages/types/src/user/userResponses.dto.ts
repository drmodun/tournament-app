import { subscriptionEnum, userRoleEnum } from "src/enums";

export interface MiniUserResponse {
  id: number;
  username: string;
}

export interface MiniUserResponseWithProfilePicture extends MiniUserResponse {
  profilePicture: string;
}

export interface MiniUserResponseWithCountry
  extends MiniUserResponseWithProfilePicture {
  country: string;
}

export interface UserResponse extends MiniUserResponseWithCountry {
  email: string;
  bio: string;
  level: number;
  name: string;
  updatedAt: Date;
  followers: number;
}

export interface ExtendedUserResponse extends UserResponse {
  location: string;
  following: number;
  createdAt: Date;
}

export interface AdminUserResponse extends ExtendedUserResponse {
  subscription: subscriptionEnum;
  password: string;
  role: userRoleEnum;
  code: string;
}

export type BaseUserResponseType =
  | MiniUserResponse
  | MiniUserResponseWithProfilePicture
  | MiniUserResponseWithCountry
  | UserResponse
  | ExtendedUserResponse
  | AdminUserResponse;

export enum UserResponsesEnum {
  MINI = "mini",
  MINI_WITH_PFP = "mini-with-pfp",
  MINI_WITH_COUNTRY = "mini-with-country",
  BASE = "base",
  EXTENDED = "extended",
  ADMIN = "admin",
}

export enum UserSortingEnum {
  USERNAME = "username",
  LEVEL = "level",
  UPDATED_AT = "updatedAt",
  COUNTRY = "country",
  LOCATION = "location",
  BETTING_POINTS = "betting-points",
  TOURNAMENT_PARTICIPATION = "tournament-participation",
  TOURNAMENTS_WON = "tournaments-won", // TODO: This has to be custom sqled
  TOURNAMENTS_MODERATED = "tournaments-moderated",
  GROUP_JOIN_DATE = "group-join-date",
}

export type UserResponseEnumType =
  (typeof UserResponsesEnum)[keyof typeof UserResponsesEnum];

export type UserSortingEnumType =
  (typeof UserSortingEnum)[keyof typeof UserSortingEnum];

//TODO: potentially add more content
