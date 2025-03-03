import { ILocationResponse } from "src/location/responses.dto";

export interface IMiniGroupResponse {
  id: number;
  name: string;
  abbreviation: string;
  locationId?: number;
}

export interface IMiniGroupResponseWithLogo extends IMiniGroupResponse {
  logo: string;
}

export interface IMiniGroupResponseWithCountry
  extends IMiniGroupResponseWithLogo {
  country: string;
}

export interface IGroupResponse extends IMiniGroupResponseWithCountry {
  description: string;
  type: string;
  focus: string;
  logo: string;
  updatedAt: string;
  memberCount: number;
  location?: ILocationResponse;
}

export interface IGroupResponseExtended extends IGroupResponse {
  createdAt: string;
  tournamentCount: number;
  subscriberCount: number;
}

export type BaseGroupResponse =
  | IMiniGroupResponse
  | IMiniGroupResponseWithLogo
  | IMiniGroupResponseWithCountry
  | IGroupResponse
  | IGroupResponseExtended;

export enum GroupResponsesEnum {
  MINI = "mini",
  MINI_WITH_LOGO = "mini-with-logo",
  MINI_WITH_COUNTRY = "mini-with-country",
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

