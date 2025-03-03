import { ICareerCategoryResponse } from "src/career";
import { IMiniGroupResponseWithLogo } from "src/group";
import {
  IMiniUserResponseWithCountry,
  IMiniUserResponseWithProfilePicture,
} from "src/user";

export interface IMiniRosterResponse {
  id: number;
  stageId: number;
  participationId: number;
  group?: IMiniGroupResponseWithLogo;
  user?: IMiniUserResponseWithProfilePicture;
}

export interface IRosterPlayer {
  user: IMiniUserResponseWithCountry;
  isSubstitute: boolean;
  career: ICareerCategoryResponse[];
}

export interface IRosterPlayerWithoutCareer {
  user: IMiniUserResponseWithCountry;
  isSubstitute: boolean;
}

export interface IRosterResponse extends IMiniRosterResponse {
  players: IRosterPlayer[];
  createdAt: Date;
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
  GROUP_NAME = "group.name",
  USER_NAME = "player.name",
  RESULT = "result", // TODO: implement later
}

export type RosterResponseEnumType =
  (typeof RosterResponsesEnum)[keyof typeof RosterResponsesEnum];

export type RosterSortingEnumType =
  (typeof RosterSortingEnum)[keyof typeof RosterSortingEnum];

export interface IMiniRosterResponse {
  id: number;
  stageId: number;
  participationId: number;
  group?: IMiniGroupResponseWithLogo;
  user?: IMiniUserResponseWithProfilePicture;
  participation?: {
    id: number;
    tournament: {
      categoryId: number;
    };
  };
}
