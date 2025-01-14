export interface IGroupInviteQuery {
  userId?: number;
  groupId?: number;
  relatedLFTId?: number;
}

export interface ICreateGroupInviteDto {
  message: string;
  relatedLFTId?: number;
}

export interface IUpdateGroupInviteDto {
  message?: string;
  relatedLFTId?: number;
}
