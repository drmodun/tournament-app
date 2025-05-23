import { notificationTypeEnumType } from '^tournament-app/types';

export interface EmailGenerationData {
  to: string;
  subject: string;
  template: TemplatesEnum;
  data?: object;
}

export enum TemplatesEnum {
  WELCOME = 'welcome',
  RESET_PASSWORD = 'reset-password',
  EMAIL_CONFIRMATION = 'email-confirmation',
  NOTIFICATION_OF_BAN = 'notification-of-ban',
  BET_OUTCOME = 'bet-outcome',
  TOURNAMENT_REMINDER = 'tournament-reminder',
  TOURNAMENT_START = 'tournament-start',
  TOURNAMENT_END = 'tournament-end',
  GROUP_INVITATION = 'group-invitation',
  GROUP_JOIN_REQUEST = 'group-join-request',
  GROUP_JOIN_APPROVAL = 'group-join-approval',
  GROUP_JOIN_REJECTION = 'group-join-rejection',
  GROUP_REMOVAL = 'group-removal',
  GROUP_ADMIN_PROMOTION = 'group-admin-promotion',
  GROUP_ADMIN_DEMOTION = 'group-admin-demotion',
  TEST_TEMPLATE = 'test-template',
  NEW_FOLLOWER = 'new-follower',
}

class WelcomeInfo {
  username: string;
}

export class ResetPasswordInfo {
  username: string;
  resetLink: string;
  email: string;
}

export class VerifyEmailInfo {
  link: string;
  email: string;
  username: string;
}

class NotificationOfBanInfo {
  reason: string;
}

class BetOutcomeInfo {
  bet: string;
  outcome: string;
}

class TournamentReminderInfo {
  tournament: string;
}

class TournamentStartInfo {
  tournament: string;
}

class TournamentEndInfo {
  tournament: string;
}

class GroupInvitationInfo {
  group: string;
}

class GroupJoinRequestInfo {
  group: string;
}

class GroupJoinApprovalInfo {
  group: string;
}

class GroupJoinRejectionInfo {
  group: string;
}

class GroupRemovalInfo {
  group: string;
}

class GroupAdminPromotionInfo {
  group: string;
}

class GroupAdminDemotionInfo {
  group: string;
}

class NewFollowerInfo {
  follower: string;
}

export const emailTemplateBodies: Record<TemplatesEnum, object> = {
  welcome: WelcomeInfo,
  'bet-outcome': BetOutcomeInfo,
  'group-admin-demotion': GroupAdminDemotionInfo,
  'group-admin-promotion': GroupAdminPromotionInfo,
  'group-invitation': GroupInvitationInfo,
  'group-join-approval': GroupJoinApprovalInfo,
  'group-join-rejection': GroupJoinRejectionInfo,
  'group-join-request': GroupJoinRequestInfo,
  'group-removal': GroupRemovalInfo,
  'notification-of-ban': NotificationOfBanInfo,
  'reset-password': ResetPasswordInfo,
  'tournament-end': TournamentEndInfo,
  'tournament-reminder': TournamentReminderInfo,
  'tournament-start': TournamentStartInfo,
  'email-confirmation': VerifyEmailInfo,
  'new-follower': NewFollowerInfo,
  'test-template': {},
};

export interface NotificationCreateDto {
  type: notificationTypeEnumType;
  message: string;
  link?: string;
  image?: string;
  read?: boolean;
}
