export interface IUpdateMembershipRequest {
  role?: string;
}

export interface IGroupMembershipQueryRequest {
  userId?: number;
  groupId?: number;
  role?: string;
}

export type BaseUpdateMembershipRequest = { role?: string };

// If more are needed it can be added (like settings and other stuff)
