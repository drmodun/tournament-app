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
  username: string;
  reason: string;
}

class BetOutcomeInfo {
  username: string;
  bet: string;
  outcome: string;
}

class TournamentReminderInfo {
  username: string;
  tournament: string;
}

class TournamentStartInfo {
  username: string;
  tournament: string;
}

class TournamentEndInfo {
  username: string;
  tournament: string;
}

class GroupInvitationInfo {
  username: string;
  group: string;
}

class GroupJoinRequestInfo {
  username: string;
  group: string;
}

class GroupJoinApprovalInfo {
  username: string;
  group: string;
}

class GroupJoinRejectionInfo {
  username: string;
  group: string;
}

class GroupRemovalInfo {
  username: string;
  group: string;
}

class GroupAdminPromotionInfo {
  username: string;
  group: string;
}

class GroupAdminDemotionInfo {
  username: string;
  group: string;
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
  'test-template': {},
};
