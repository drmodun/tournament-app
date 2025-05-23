import { userRoleEnum } from "src/enums";

export interface IMiniUserResponse {
  id: number;
  username: string;
  isFake: boolean;
}

export interface IMiniUserResponseWithProfilePicture extends IMiniUserResponse {
  profilePicture: string;
}

export interface IMiniUserResponseWithCountry
  extends IMiniUserResponseWithProfilePicture {
  country: string;
}

export interface IUserResponse extends IMiniUserResponseWithCountry {
  email: string;
  bio: string;
  level: number;
  name: string;
  updatedAt: Date;
  age: number;
  followers: number;
}

export interface IExtendedUserResponse extends IUserResponse {
  location: string;
  following: number;
  createdAt: Date;
}

export interface IAdminUserResponse extends IExtendedUserResponse {
  role: userRoleEnum;
}

export type BaseUserResponseType =
  | IMiniUserResponse
  | IMiniUserResponseWithProfilePicture
  | IMiniUserResponseWithCountry
  | IUserResponse
  | IExtendedUserResponse
  | IAdminUserResponse;

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
  BETTING_POINTS = "betting-points",
  TOURNAMENT_PARTICIPATION = "tournament-participation",
  TOURNAMENTS_WON = "tournaments-won",
  TOURNAMENTS_MODERATED = "tournaments-moderated",
  GROUP_JOIN_DATE = "group-join-date",
}

export type UserResponseEnumType =
  (typeof UserResponsesEnum)[keyof typeof UserResponsesEnum];

export type UserSortingEnumType =
  (typeof UserSortingEnum)[keyof typeof UserSortingEnum];
