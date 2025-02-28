import { IMiniGroupResponseWithLogo } from "src/group";
import { IMiniUserResponseWithCountry } from "src/user";

export interface IMiniRosterResponse {
  id: number;
  stageId: number;
  participationId: number;
  group?: IMiniGroupResponseWithLogo;
  user?: IMiniGroupResponseWithLogo;
}

export interface IRosterResponse extends IMiniRosterResponse {
  player: IMiniUserResponseWithCountry;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExtendedRosterResponse extends IRosterResponse {
  //TODO: add roster results here
}

export type BaseRosterResponse =
  | IMiniRosterResponse
  | IRosterResponse
  | IExtendedRosterResponse;

export enum RosterResponsesEnum {
  MINI = "mini",
  BASE = "base",
  EXTENDED = "extended",
}

export enum RosterSortingEnum {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  GROUP_NAME = "group.name",
  USER_NAME = "player.name",
  RESULT = "result", // TODO: implement later
}

export type RosterResponseEnumType =
  (typeof RosterResponsesEnum)[keyof typeof RosterResponsesEnum];

export type RosterSortingEnumType =
  (typeof RosterSortingEnum)[keyof typeof RosterSortingEnum];
