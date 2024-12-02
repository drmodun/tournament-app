import { userRoleEnumType } from "src/enums";
import {
  IGroupResponse,
  IMiniGroupResponse,
  IMiniGroupResponseWithCountry,
} from "src/group/responses.dto";
import {
  IMiniUserResponseWithCountry,
  IMiniUserResponseWithProfilePicture,
} from "src/user";

export interface IMinimalMembershipResponse {
  groupId: number;
  userId: number;
  role: userRoleEnumType;
}

export interface IGroupMembershipResponse {
  groupId: number;
  userId: number;
  role: userRoleEnumType;
  createdAt: string;
  updatedAt: string;
}

export interface IUserMembershipResponseWithDates
  extends IMiniGroupResponseWithCountry {
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroupMembershipResponseWithDates
  extends IMiniGroupResponseWithCountry {
  createdAt: Date;
  updatedAt: Date;
}

export type BaseGroupMembershipResponseType =
  | IMinimalMembershipResponse
  | IGroupMembershipResponse
  | IMiniUserResponseWithCountry
  | IUserMembershipResponseWithDates
  | IMiniUserResponseWithProfilePicture
  | IMiniGroupResponse
  | IMiniGroupResponseWithCountry
  | IGroupResponse; //TODO: consider if all of these are needed

export enum GroupMembershipResponsesEnum {
  MINI = "mini",
  BASE = "base",
  USER_MINI_WITH_COUNTRY = "user-mini-with-country",
  USER_WITH_DATES = "user-with-dates",
  GROUP_MINI = "group-mini",
  GROUP_MINI_WITH_COUNTRY = "group-mini-with-country",
  GROUP_WITH_DATES = "group-with-dates",
}

export enum GroupMembershipSortingEnum {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  ROLE = "role",
}

export type GroupMembershipReturnTypesEnumType =
  (typeof GroupMembershipResponsesEnum)[keyof typeof GroupMembershipResponsesEnum];

export type GroupMembershipSortType =
  (typeof GroupMembershipSortingEnum)[keyof typeof GroupMembershipSortingEnum];
