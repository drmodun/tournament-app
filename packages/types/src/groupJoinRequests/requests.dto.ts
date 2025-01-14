export interface IGroupJoinRequestQuery {
  userId?: number;
  groupId?: number;
  relatedLFPId?: number;
}

export interface ICreateGroupJoinRequest {
  message: string;
  relatedLFPId?: number;
}

export interface IUpdateGroupJoinRequest {
  message?: string;
  relatedLFPId?: number;
}
