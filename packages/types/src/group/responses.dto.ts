export interface IMiniGroupResponse {
  name: string;
  abbreviation: string;
}

export interface IMiniGroupResponseWithLogo extends IMiniGroupResponse {
  logo: string;
}

export interface IMiniGroupResponseWithCountry extends IMiniGroupResponse {
  country: string;
}

export interface IGroupResponse extends IMiniGroupResponseWithCountry {
  description: string;
  type: string;
  focus: string;
  logo: string;
  location: string;
  updatedAt: string;
}

export interface IGroupResponseExtended extends IGroupResponse {
  createdAt: string;
}

export type BaseGroupResponse =
  | IMiniGroupResponse
  | IMiniGroupResponseWithLogo
  | IGroupResponse;

export enum GroupResponsesEnum {
  MINI = "mini",
  MINI_WITH_LOGO = "mini-with-logo",
  BASE = "base",
  EXTENDED = "extended",
}

export enum GroupSortingEnum {
  NAME = "name",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  TOURNAMENT_COUNT = "tournament-count",
  MEMBER_COUNT = "member-count",
  SUBSCRIBER_COUNT = "subscriber-count",
}

export type GroupReturnTypesEnumType =
  (typeof GroupResponsesEnum)[keyof typeof GroupResponsesEnum];

export type GroupSortingEnumType =
  (typeof GroupSortingEnum)[keyof typeof GroupSortingEnum];

//TODO: maybe add another one for groups and categories
