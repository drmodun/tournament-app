export interface ICreateRosterMemberRequest {
  userId: number;
  isSubstitute: boolean;
}

export interface ICreateRosterRequest {
  members: ICreateRosterMemberRequest[];
}

export interface IUpdateRosterMemberRequest {
  isSubstitute: boolean;
}

export interface IQueryRosterMembersRequest {
  rosterId: number;
}

export interface IQueryRosterMemberRequest {
  rosterId: number;
  userId: number;
}
