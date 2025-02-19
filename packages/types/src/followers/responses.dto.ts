import { IMiniUserResponse, IUserResponse } from "../user/responses.dto";

export interface IFollowerResponse extends IUserResponse {
  createdAt: Date;
}

export interface IFollowerMiniResponse extends IMiniUserResponse {
  createdAt: Date;
}

export enum FollowerResponsesEnum {
  FOLLOWER = "base",
  FOLLOWER_MINI = "mini",
  FOLLOWING = "following",
  FOLLOWING_MINI = "following-mini",
}

export type FollowerResponseType = IFollowerResponse | IFollowerMiniResponse;
