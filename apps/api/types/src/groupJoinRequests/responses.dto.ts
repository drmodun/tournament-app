import {
  IMiniUserResponse,
  IMiniUserResponseWithProfilePicture,
  IUserResponse,
} from "../user/responses.dto";
import {
  IMiniGroupResponseWithLogo,
  IGroupResponse,
  IMiniGroupResponse,
} from "../group/responses.dto";

export interface IGroupJoinRequestWithUserResponse extends IUserResponse {
  groupId: number;
  message: string;
}

export interface IGroupJoinRequestWithMiniUserResponse
  extends IMiniUserResponseWithProfilePicture {
  createdAt: Date;
}

export interface IGroupJoinRequestWithGroupResponse extends IGroupResponse {
  userId: number;
  message: string;
}

export interface IGroupJoinRequestWithMiniGroupResponse
  extends IMiniGroupResponseWithLogo {
  createdAt: Date;
}

export interface IGroupJoinRequestForNotification {
  user: IMiniUserResponse;
  group: IMiniGroupResponseWithLogo;
}

export type BaseGroupJoinRequestResponseType =
  | IGroupJoinRequestWithUserResponse
  | IGroupJoinRequestWithMiniUserResponse
  | IGroupJoinRequestWithGroupResponse
  | IGroupJoinRequestWithMiniGroupResponse
  | IGroupJoinRequestForNotification;

export enum GroupJoinRequestResponsesEnum {
  WITH_USER = "with-user",
  WITH_MINI_USER = "with-mini-user",
  WITH_GROUP = "with-group",
  WITH_MINI_GROUP = "with-mini-group",
  FOR_NOTIFICATION = "for-notification",
}

export enum GroupJoinRequestSortingEnum {
  CREATED_AT = "created_at",
}
