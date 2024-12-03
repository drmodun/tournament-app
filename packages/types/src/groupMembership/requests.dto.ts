export interface IUpdateMembershipRequest {
  role?: string;
}

export interface IGroupMembershipQueryRequest {
  userId?: string;
  groupId?: string;
  role?: string;
}

export type BaseUpdateMembershipRequest = { role?: string };

// If more are needed it can be added (like settings and other stuff)
