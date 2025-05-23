import { IMiniUserResponseWithProfilePicture, IUserResponse } from "../user";
import {
  IGroupResponse,
  IMiniGroupResponseWithLogo,
} from "../group/responses.dto";

export interface IGroupInviteWithUserResponse extends IUserResponse {
  message: string;
  groupId: number;
}

export interface IGroupInviteWithMiniUserResponse
  extends IMiniUserResponseWithProfilePicture {
  createdAt: Date;
}

export interface IGroupInviteWithGroupResponse extends IGroupResponse {
  message: string;
  userId: number;
}

export interface IGroupInviteWithMiniGroupResponse
  extends IMiniGroupResponseWithLogo {
  createdAt: Date;
}

export type GroupInviteResponse =
  | IGroupInviteWithUserResponse
  | IGroupInviteWithMiniUserResponse
  | IGroupInviteWithGroupResponse
  | IGroupInviteWithMiniGroupResponse;

export enum GroupInviteResponsesEnum {
  WITH_USER = "with-user",
  WITH_MINI_USER = "with-mini-user",
  WITH_GROUP = "with-group",
  WITH_MINI_GROUP = "with-mini-group",
}

export enum GroupInviteSortingEnum {
  CREATED_AT = "created_at",
}
