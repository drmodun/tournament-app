export interface ICreateRosterMemberRequest {
  userId: number;
  isSubstitute: boolean;
}

export interface IAddRosterMemberRequest {
  isSubstitute: boolean;
}

export interface ICreateRosterRequest {
  members: ICreateRosterMemberRequest[];
}

export interface IUpdateRosterMemberRequest {
  isSubstitute: boolean;
}

export interface IQueryRosterRequest {
  stageId?: number;
  participationId?: number;
  groupId?: number;
  userId?: number;
}
