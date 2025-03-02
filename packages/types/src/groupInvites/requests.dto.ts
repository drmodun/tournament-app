export interface IGroupInviteQuery {
  userId?: number;
  groupId?: number;
  relatedLFGId?: number;
}

export interface ICreateGroupInviteDto {
  message: string;
  relatedLFGId?: number;
}

export interface IUpdateGroupInviteDto {
  message?: string;
  relatedLFGId?: number;
}
