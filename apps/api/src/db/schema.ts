import {
  betStatusEnum,
  betTypeEnum,
  chatRoomTypeEnum,
  exportEnumValues,
  groupRoleEnum,
  likeTypeEnum,
  matchupTypeEnum,
  messageVisibilityEnum,
  notificationTypeEnum,
  OrganizerRoleEnum,
  quizQuestionTypeEnum,
  submissionStatusEnum,
  subscriptionEnum,
  tournamentLocationEnum,
  tournamentPromotionTypeEnum,
  tournamentTypeEnum,
  userRoleEnum,
  categoryTypeEnum,
  tournamentTeamTypeEnum,
  groupFocusEnum,
  groupTypeEnum,
  pointConversionTypeEnum,
  pointConversionStrategyEnum,
  stageTypeEnum,
  stageStatusEnum,
} from '@tournament-app/types';
import { relations, sql } from 'drizzle-orm';
import {
  serial,
  text,
  timestamp,
  pgTable,
  pgEnum,
  boolean,
  integer,
  primaryKey,
  numeric,
  customType,
  index,
} from 'drizzle-orm/pg-core';

const geography = customType<{
  data: string;
  config: { srid: number; type: string };
}>({
  dataType(config) {
    return `geography(${config.type}, ${config.srid})`;
  },
  toDriver(value: string) {
    return value; // Pass WKT strings to the database
  },
  fromDriver(value: string): string {
    return value; // Receive WKT strings from the database
  },
});

export const userRole = pgEnum('user_role', exportEnumValues(userRoleEnum));

export const tournamentType = pgEnum(
  'tournament_type',
  exportEnumValues(tournamentTypeEnum),
);

export const betStatus = pgEnum('bet_status', exportEnumValues(betStatusEnum));

export const userSubscription = pgEnum(
  'user_subscription',
  exportEnumValues(subscriptionEnum),
);

export const notificationType = pgEnum(
  'notification_type',
  exportEnumValues(notificationTypeEnum),
);

export const submissionStatus = pgEnum(
  'submission_status',
  exportEnumValues(submissionStatusEnum),
);

export const tournamentTeamType = pgEnum(
  'tournament_team_type',
  exportEnumValues(tournamentTeamTypeEnum),
);

export const betType = pgEnum('bet_type', exportEnumValues(betTypeEnum));

export const organizerRole = pgEnum(
  'organizer_role',
  exportEnumValues(OrganizerRoleEnum),
);

export const quizQuestionType = pgEnum(
  'quiz_question_type',
  exportEnumValues(quizQuestionTypeEnum),
);

export const stageType = pgEnum('stage_type', exportEnumValues(stageTypeEnum));

export const stageStatus = pgEnum(
  'stage_status',
  exportEnumValues(stageStatusEnum),
);

export const matchupType = pgEnum(
  'matchup_type',
  exportEnumValues(matchupTypeEnum),
);

export const likeType = pgEnum('like_type', exportEnumValues(likeTypeEnum));

export const tournamentLocation = pgEnum(
  'tournament_location',
  exportEnumValues(tournamentLocationEnum),
);

export const pointConversionType = pgEnum(
  'point_conversion_strategy_type',
  exportEnumValues(pointConversionTypeEnum),
);

export const pointConversionStrategy = pgEnum(
  'point_conversion_strategy',
  exportEnumValues(pointConversionStrategyEnum),
);

export const tournamentPromotionType = pgEnum(
  'tournament_promotion_type',
  exportEnumValues(tournamentPromotionTypeEnum),
);

export const chatRoomType = pgEnum(
  'chat_room_type',
  exportEnumValues(chatRoomTypeEnum),
);

export const messageVisibility = pgEnum(
  'message_visibility',
  exportEnumValues(messageVisibilityEnum),
);

export const categoryType = pgEnum(
  'category_type',
  exportEnumValues(categoryTypeEnum),
);

export const groupRole = pgEnum('group_role', exportEnumValues(groupRoleEnum));

export const groupFocus = pgEnum(
  'group_focus',
  exportEnumValues(groupFocusEnum),
);

export const groupType = pgEnum('group_type', exportEnumValues(groupTypeEnum));

export const user = pgTable(
  'user',
  {
    id: serial('id').unique().primaryKey(),
    name: text('name').notNull(),
    username: text('username').notNull(),
    profilePicture: text('profile_picture'),
    bio: text('bio').default('A user on the tournament app platform'),
    email: text('email').notNull().unique(),
    password: text('password'), //hashed password
    role: userRole('role').default('user'),
    passwordResetToken: text('password_reset_token'),
    passwordResetTokenExpiresAt: timestamp('password_reset_token_expires_at', {
      withTimezone: true,
    }),
    emailConfirmationToken: text('email_confirmation_token'),
    sseToken: text('sse_token').$defaultFn(() => crypto.randomUUID()),
    isFake: boolean('is_fake').default(false),
    isEmailVerified: boolean('is_email_verified').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
    country: text('country'),
    stripeCustomerId: text('stripe_customer_id'),
    bettingPoints: integer('betting_points').default(100),
    customerId: text('customer_id'),
    level: integer('level').default(1),
    dateOfBirth: timestamp('date_of_birth', { withTimezone: true })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),

    // For gdpr sake we will not store location, just use geolocation in query params
  },
  (t) => ({
    usernameIndex: index('username_index').using('btree', t.username),
  }),
);

export const userRelations = relations(user, ({ many }) => ({
  userToRoster: many(userToRoster),
  career: many(categoryCareer),
}));

export const userNotificationSettings = pgTable('user_notification_settings', {
  userId: integer('user_id')
    .references(() => user.id, {
      onDelete: 'cascade',
    })
    .unique(),
  emailNotifications: boolean('email_notifications').default(true),
  pushNotifications: boolean('push_notifications').default(true),
  inAppNotifications: boolean('in_app_notifications').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const userToNotificationTokens = pgTable('user_to_notification_tokens', {
  userId: integer('user_id')
    .references(() => user.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  token: text('token').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const location = pgTable(
  'location',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    apiId: text('api_id').notNull(),
    coordinates: geography('coordinates', {
      srid: 4326,
      type: 'POINT',
    }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (location) => ({
    locationIndex: index('location_index').using('gist', location.coordinates),
  }),
);

export const subscription = pgTable('subscription', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  enum: userSubscription('enum'),
  description: text('description'),
  benefits: text('benefits'),
  stripeProductId: text('stripe_product_id'),
  price: integer('price').notNull(),
  autoRenewal: boolean('auto_renewal').default(true),
  nextPaymentDate: timestamp('next_payment_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const subscriptionBenefit = pgTable('subscription_benefits', {
  id: serial('id').primaryKey(),
  subscriptionId: integer('subscription_id')
    .references(() => subscription.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  benefit: text('benefit').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const subscriptionToUser = pgTable(
  'subscription_user',
  {
    userId: integer('user_id')
      .references(() => user.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    subscriptionId: integer('subscription_id')
      .references(() => subscription.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.subscriptionId] }),
  }),
);

export const achievement = pgTable('achievement', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  levels: integer('levels').default(1),
  points: integer('points').default(5),
  goal: integer('goal').default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const achievementToUser = pgTable(
  'achievement_user',
  {
    userId: integer('user_id')
      .references(() => user.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    achievementId: integer('achievement_id')
      .references(() => achievement.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    level: integer('level').default(0),
    progress: integer('points').default(0),
    levelUpdatedAt: timestamp('level_updated_at', {
      withTimezone: true,
    }).$onUpdate(() => new Date()),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.achievementId] }),
  }),
);

export const tournament = pgTable(
  'tournament',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    tournamentLocation: tournamentLocation('tournament_location').default(
      'online',
    ),
    country: text('country'),
    parentTournamentId: integer('parent_tournament_id').references(
      () => tournament.id,
      {
        onDelete: 'cascade',
      },
    ),
    conversionRuleId: integer('conversion_rule_id').references(
      () => pointConversionRule.id,
    ),
    minimumLevel: integer('minimum_level').default(-1),
    logo: text('logo'),
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }),
    isPublic: boolean('is_public').default(true),
    links: text('links'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    tournamentType: tournamentType('tournament_type').default('league'),
    minimumMMR: integer('minimum_mmr').default(0),
    maximumMMR: integer('maximum_mmr').default(999999),
    locationId: integer('location_id').references(() => location.id, {
      onDelete: 'cascade',
    }),
    isMultipleTeamsPerGroupAllowed: boolean(
      'is_multiple_teams_per_group_allowed',
    ).default(false),
    isFakePlayersAllowed: boolean('is_fake_players_allowed').default(false),
    isRanked: boolean('is_ranked').default(false),
    maxParticipants: integer('max_participants').default(32),
    tournamentTeamType: tournamentTeamType('tournament_team_type').default(
      'team',
    ),
    categoryId: integer('category_id')
      .references(() => category.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    creatorId: integer('creator_id')
      .references(() => user.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    affiliatedGroupId: integer('affiliated_group_id').references(
      () => group.id,
      {
        onDelete: 'cascade',
      },
    ),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    nameIndex: index('tournament_name_index').using('btree', t.name),
  }),
);

export const chatRoom = pgTable('chat_room', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  chatRoomType: chatRoomType('chat_room_type').default('direct'),
});

export const chatRoomToUser = pgTable(
  'chat_room_user',
  {
    userId: integer('user_id')
      .references(() => user.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    chatRoomId: integer('chat_room_id')
      .references(() => chatRoom.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.chatRoomId] }),
  }),
);

export const chatRoomMessage = pgTable('chatRoomMessage', {
  id: serial('id').primaryKey(),
  chatRoomId: integer('chat_room_id')
    .references(() => chatRoom.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  userId: integer('user_id')
    .references(() => user.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  visibility: messageVisibility('visibility').default('public'),
});

export const groupFollower = pgTable(
  'group_follower',
  {
    userId: integer('user_id')
      .references(() => user.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    groupId: integer('group_id')
      .references(() => group.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.groupId] }),
  }),
);

export const follower = pgTable(
  'follower',
  {
    userId: integer('user_id')
      .references(() => user.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    followerId: integer('follower_id')
      .references(() => user.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.followerId] }),
  }),
);

export const directMessage = pgTable(
  'direct_message',
  {
    senderId: integer('sender_id')
      .references(() => user.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    receiverId: integer('receiver_id')
      .references(() => user.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    message: text('message').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.senderId, t.receiverId] }),
  }),
);

export const group = pgTable(
  'group',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    abbreviation: text('abbreviation').notNull(),
    description: text('description'),
    logo: text('logo'),
    country: text('country'),
    locationId: integer('location_id').references(() => location.id, {
      onDelete: 'cascade',
    }),
    type: groupType('group_type').default('public'),
    focus: groupFocus('group_focus').default('hybrid'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    nameIndex: index('group_name_index').using('btree', t.name),
  }),
);

export const groupInterests = pgTable(
  'group_interests',
  {
    groupId: integer('group_id')
      .references(() => group.id)
      .notNull(),
    categoryId: integer('category_id')
      .references(() => category.id)
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.groupId, t.categoryId] }),
  }),
);

export const groupToUser = pgTable(
  'group_user',
  {
    userId: integer('user_id')
      .references(() => user.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    groupId: integer('group_id')
      .references(() => group.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    role: groupRole('role').default('member'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.groupId] }),
  }),
);

export const groupRequirements = pgTable('group_requirements', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id')
    .references(() => group.id, {
      onDelete: 'cascade',
    })
    .unique(),
  minimumAge: integer('minimum_age'),
  maximumAge: integer('maximum_age'),
  isSameCountry: boolean('is_same_country').default(false),
});

export const eloRequirement = pgTable('elo_requirement', {
  id: serial('id').primaryKey(),
  groupRequirementId: integer('group_id').references(() => group.id, {
    onDelete: 'cascade',
  }),
  categoryId: integer('category_id').references(() => category.id, {
    onDelete: 'cascade',
  }),
  minimumElo: integer('minimum_elo'),
  maximumElo: integer('maximum_elo'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const groupInvite = pgTable(
  'group_invite',
  {
    groupId: integer('group_id')
      .references(() => group.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    userId: integer('user_id')
      .references(() => user.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    message: text('message'), // TO add more fields and stuff if needed
    relatedLFGId: integer('related_lfg_id').references(
      () => lookingForGroup.id,
    ), // If it is related to any LFG
  },
  (t) => ({
    pk: primaryKey({ columns: [t.groupId, t.userId] }),
  }),
);

export const groupJoinRequest = pgTable(
  'group_join_request',
  {
    groupId: integer('group_id')
      .references(() => group.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    userId: integer('user_id')
      .references(() => user.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    message: text('message'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    relatedLFPId: integer('related_lfp_id').references(
      () => lookingForPlayers.id,
    ),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.groupId, t.userId] }),
  }),
);

export const category = pgTable(
  'category',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    image: text('image'),
    type: categoryType('category_type').default('other'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    nameIndex: index('category_name_index').using('btree', t.name),
  }),
);

export const interests = pgTable(
  'interests',
  {
    userId: integer('user_id')
      .references(() => user.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    categoryId: integer('category_id')
      .references(() => category.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.categoryId] }),
  }),
);

export const subcategory = pgTable('subcategory', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  categoryId: integer('category_id')
    .references(() => category.id, {
      onDelete: 'cascade',
    })
    .notNull(),
});

export const pointConversionRule = pgTable('conversion_rule', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  source: integer('source').notNull(),
  destination: integer('destination').notNull(),
  points: integer('points').default(0),
  type: pointConversionType('type').default('stage_to_stage'),
  strategy: pointConversionStrategy('strategy').default('ranking'),
  from: integer('from'),
  to: integer('to'),
  minPoints: integer('min_points'),
  maxPoints: integer('max_points'),
  pointsPerPlace: integer('points_per_place'),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const participation = pgTable('participation', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').references(() => group.id, {
    onDelete: 'cascade',
  }),
  userId: integer('user_id').references(() => user.id, {
    onDelete: 'cascade',
  }),
  tournamentId: integer('tournament_id')
    .references(() => tournament.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  points: integer('points').default(0),
});

export const stage = pgTable('stage', {
  id: serial('id').primaryKey(),
  tournamentId: integer('tournament_id').references(() => tournament.id, {
    onDelete: 'cascade',
  }),
  conversionRuleId: integer('conversion_rule_id').references(
    () => pointConversionRule.id,
  ),
  stageStatus: stageStatus('stage_status').default('upcoming'),
  stageType: stageType('stage_type').default('group'),
  name: text('name').notNull(),
  stageLocation: tournamentLocation('stage_location').default('online'),
  locationId: integer('location_id').references(() => location.id, {
    onDelete: 'cascade',
  }),
  challongeTournamentId: text('challonge_tournament_id'),
  description: text('description'),
  logo: text('logo'),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  minPlayersPerTeam: integer('min_players_per_team').default(1),
  maxPlayersPerTeam: integer('max_players_per_team'),
  maxSubstitutes: integer('max_substitutes'),
  maxChanges: integer('max_changes'),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const roster = pgTable('roster', {
  id: serial('id').primaryKey(), //Multiple teams per group allowed
  participationId: integer('participation_id')
    .references(() => participation.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  stageId: integer('stage_id')
    .references(() => stage.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  challongeParticipantId: text('challonge_participant_id'),
  points: integer('points').default(0), //See how to implement placements for mor complex brackets
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const userToRoster = pgTable(
  'user_roster',
  {
    userId: integer('user_id')
      .references(() => user.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    rosterId: integer('roster_id')
      .references(() => roster.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    isSubstitute: boolean('is_substitute').default(false),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.rosterId] }),
  }),
);

export const matchup = pgTable('matchup', {
  id: serial('id').primaryKey(),
  stageId: integer('stage_id')
    .references(() => stage.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  roundId: integer('round_id').references(() => stageRound.id, {
    onDelete: 'cascade',
  }),
  round: integer('round_number'),
  matchupType: matchupType('matchup_type').default('one_vs_one'),
  challongeMatchupId: text('challonge_matchup_id'),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  parentMatchupId: integer('parent_matchup_id').references(() => matchup.id),
  isFinished: boolean('is_finished').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const rosterToMatchup = pgTable(
  'roster_matchup',
  {
    rosterId: integer('roster_id')
      .references(() => roster.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    matchupId: integer('matchup_id')
      .references(() => matchup.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    isWinner: boolean('is_winner').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.rosterId, t.matchupId] }),
  }),
);

export const rosterRelations = relations(roster, ({ many, one }) => ({
  players: many(userToRoster),
  participation: one(participation, {
    fields: [roster.participationId],
    references: [participation.id],
  }),
  stage: one(stage, {
    fields: [roster.stageId],
    references: [stage.id],
  }),
  rosterMatchup: many(rosterToMatchup),
  scoreToRoster: many(scoreToRoster),
}));

export const matchupRelations = relations(matchup, ({ many }) => ({
  rosterToMatchup: many(rosterToMatchup),
  score: many(score),
}));

export const rosterToMatchupRelations = relations(
  rosterToMatchup,
  ({ one }) => ({
    matchup: one(matchup, {
      fields: [rosterToMatchup.matchupId],
      references: [matchup.id],
    }),
    roster: one(roster, {
      fields: [rosterToMatchup.rosterId],
      references: [roster.id],
    }),
  }),
);

export const userToRosterRelations = relations(userToRoster, ({ one }) => ({
  roster: one(roster, {
    fields: [userToRoster.rosterId],
    references: [roster.id],
  }),
  user: one(user, {
    fields: [userToRoster.userId],
    references: [user.id],
  }),
}));

export const participationRelations = relations(
  participation,
  ({ one, many }) => ({
    group: one(group, {
      fields: [participation.groupId],
      references: [group.id],
    }),
    tournament: one(tournament, {
      fields: [participation.tournamentId],
      references: [tournament.id],
    }),
    user: one(user, {
      fields: [participation.userId],
      references: [user.id],
    }),
    roster: many(roster),
  }),
);

export const tournamentRelations = relations(tournament, ({ one, many }) => ({
  category: one(category, {
    fields: [tournament.categoryId],
    references: [category.id],
  }),
  participation: many(participation),
}));

export const scoreToRoster = pgTable('score_to_roster', {
  id: serial('id').primaryKey(),
  scoreId: integer('score_id').references(() => score.id),
  rosterId: integer('roster_id').references(() => roster.id, {
    onDelete: 'cascade',
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  points: integer('points').default(0),
  isWinner: boolean('is_winner').default(false),
});

export const score = pgTable('score', {
  id: serial('id').primaryKey(),
  matchupId: integer('matchup_id'),
  roundNumber: integer('round_number'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const scoreRelations = relations(score, ({ one, many }) => ({
  scoreToRoster: many(scoreToRoster),
  matchup: one(matchup, {
    fields: [score.matchupId],
    references: [matchup.id],
  }),
}));

export const scoreToRosterRelations = relations(scoreToRoster, ({ one }) => ({
  score: one(score, {
    fields: [scoreToRoster.scoreId],
    references: [score.id],
  }),
  roster: one(roster, {
    fields: [scoreToRoster.rosterId],
    references: [roster.id],
  }),
}));

export const stageRound = pgTable('stage_round', {
  id: serial('id').primaryKey(),
  stageId: integer('stage_id')
    .references(() => stage.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  roundNumber: integer('round_number').default(1),
  challongeRoundId: text('challonge_round_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const rosterToRound = pgTable(
  'roster_round',
  {
    rosterId: integer('roster_id')
      .references(() => roster.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    roundId: integer('round_id')
      .references(() => stageRound.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    score: integer('score').default(0),
    isWinner: boolean('is_winner').default(false),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.rosterId, t.roundId] }),
  }),
);

export const sponsor = pgTable('sponsor', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  logo: text('logo'),
  website: text('website'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const sponsorToTournament = pgTable(
  'sponsor_tournament',
  {
    sponsorId: integer('sponsor_id')
      .references(() => sponsor.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    tournamentId: integer('tournament_id')
      .references(() => tournament.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.sponsorId, t.tournamentId] }),
  }),
);

export const bets = pgTable('bets', {
  id: serial('id').primaryKey(),
  status: betStatus('status').default('pending'),
  userId: integer('user_id')
    .references(() => user.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  matchupId: integer('matchup_id').references(() => matchup.id, {
    onDelete: 'cascade',
  }),
  rosterId: integer('roster_id').references(() => roster.id),
  betType: betType('bet_type').default('winner'),
  bettingNumber: integer('betting_number').default(1),
  amount: integer('amount').notNull(),
  odd: numeric('odd', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const categoryCareer = pgTable(
  'category_career',
  {
    categoryId: integer('category_id')
      .references(() => category.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    userId: integer('user_id')
      .references(() => user.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    elo: integer('elo').default(1000),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.categoryId, t.userId] }),
  }),
);

export const careerSingleRelations = relations(categoryCareer, ({ one }) => ({
  user: one(user, {
    fields: [categoryCareer.userId],
    references: [user.id],
  }),
  category: one(category, {
    fields: [categoryCareer.categoryId],
    references: [category.id],
  }),
}));

export const categoryRelations = relations(category, ({ many }) => ({
  career: many(categoryCareer),
}));

export const notification = pgTable('notification', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  link: text('link'),
  image: text('image'),
  type: text('type').default('test-template'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const notificationToUser = pgTable('notification_to_user', {
  notificationId: integer('notification_id')
    .references(() => notification.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  userId: integer('user_id')
    .references(() => user.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  read: boolean('read').default(false), // TODO: consider if a read time is necessary
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  reporterId: integer('reporter_id')
    .references(() => user.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  userId: integer('user_id').references(() => user.id, {
    onDelete: 'cascade',
  }),
  tournamentId: integer('tournament_id').references(() => tournament.id),
  report: text('report').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const tournamentPost = pgTable('tournament_post', {
  id: serial('id').primaryKey(),
  tournamentId: integer('tournament_id')
    .references(() => tournament.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const tournamentPostImage = pgTable('tournament_post_image', {
  id: serial('id').primaryKey(),
  postId: integer('post_id')
    .references(() => tournamentPost.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const lookingForGroup = pgTable('looking_for_group', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => user.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  message: text('message').notNull(), // Ideally a full markdown
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const categoryToLFG = pgTable(
  'category_lfg',
  {
    categoryId: integer('category_id')
      .references(() => category.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    lfgId: integer('lfg_id')
      .references(() => lookingForGroup.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.categoryId, t.lfgId] }),
  }),
);

export const lookingForPlayers = pgTable('looking_for_players', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id')
    .references(() => group.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const categoryToLFP = pgTable(
  'category_lfp',
  {
    categoryId: integer('category_id')
      .references(() => category.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    lfpId: integer('lfp_id')
      .references(() => lookingForPlayers.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.categoryId, t.lfpId] }),
  }),
);

export const userGroupBlockList = pgTable('user_group_block_list', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => user.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  blockedGroupId: integer('blocked_group_id')
    .references(() => group.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const groupUserBlockList = pgTable('group_user_block_list', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id')
    .references(() => group.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  blockedUserId: integer('blocked_user_id')
    .references(() => user.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const resultPost = pgTable('result_post', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => user.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  stageId: integer('stage_id')
    .references(() => stage.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const resultPostImage = pgTable('result_post_image', {
  id: serial('id').primaryKey(),
  postId: integer('post_id')
    .references(() => resultPost.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const like = pgTable(
  'like',
  {
    userId: integer('user_id')
      .references(() => user.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    postId: integer('post_id').references(
      () => tournamentPost.id || resultPost.id,
      {
        onDelete: 'cascade',
      },
    ),
    likeType: likeType('like_type').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.postId, t.likeType] }),
  }),
);

export const tournamentPromotion = pgTable('tournament_promotion', {
  id: serial('id').primaryKey(),
  type: tournamentPromotionType('type').default('side_promotion'),
  tournamentId: integer('tournament_id')
    .references(() => tournament.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  image: text('image'),
  promotionStartDate: timestamp('promotion_start_date', {
    withTimezone: true,
  }).notNull(),
  promotionEndDate: timestamp('promotion_end_date', {
    withTimezone: true,
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const sponsorPromotion = pgTable('sponsor_promotion', {
  id: serial('id').primaryKey(),
  sponsorId: integer('sponsor_id')
    .references(() => sponsor.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  image: text('image'),
  link: text('link'),
  promotionStartDate: timestamp('promotion_start_date', {
    withTimezone: true,
  }).notNull(),
  promotionEndDate: timestamp('promotion_end_date', {
    withTimezone: true,
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}); //separate tables for separate payment models later

export const review = pgTable(
  'review',
  {
    userId: integer('user_id')
      .references(() => user.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    stageId: integer('stage_id').references(() => stage.id, {
      onDelete: 'cascade',
    }),
    review: text('review').notNull(),
    isHidden: boolean('is_hidden').default(false),
    rating: integer('rating').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.stageId] }),
  }),
);

export const quiz = pgTable('quiz', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  timeLimitTotal: integer('time_limit_total'), // Time limit (in seconds)
  description: text('description'),
  coverImage: text('cover_image'),
  isTest: boolean('is_test').default(true), //If it is a test, you can see all questions at once and move back and forth
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  matchupId: integer('matchup_id').references(() => matchup.id),
  stageId: integer('stage_id').references(() => stage.id),
  userId: integer('user_id')
    .references(() => user.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  isAnonymousAllowed: boolean('is_anonymous_allowed').default(false),
  isRandomizedQuestions: boolean('is_randomized_questions').default(false),
  isRetakeable: boolean('is_retakeable').default(false),
  endDate: timestamp('end_date', { withTimezone: true }),
  passingScore: integer('passing_score'), // percantage
});

export const quizTags = pgTable('quiz_tags', {
  quizId: integer('quiz_id')
    .references(() => quiz.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  tagId: integer('tag_id')
    .references(() => tags.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const tags = pgTable(
  'tags',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    nameIndex: index('tags_name_index').using('btree', t.name),
  }),
);

export const quizQuestion = pgTable('quiz_question', {
  id: serial('id').primaryKey(),
  quizId: integer('quiz_id')
    .references(() => quiz.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  question: text('question').notNull(), //question should be saved as markdownž
  questionImage: text('question_image'),
  correctAnswers: text('correct_answers'), // a csv of correct answers for non choice questions
  points: integer('points').default(5),
  timeLimit: integer('time_limit'), // Generally only for quizzes
  isImmediateFeedback: boolean('is_immediate_feedback').default(false),
  type: quizQuestionType('type').default('multiple_choice'),
  explanation: text('explanation'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const quizOption = pgTable('quiz_option', {
  id: serial('id').primaryKey(),
  quizQuestionId: integer('quiz_question_id')
    .references(() => quizQuestion.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  option: text('option').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  isCorrect: boolean('is_correct').default(false),
});

export const quizAttempt = pgTable('quiz_attempt', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => user.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  quizId: integer('quiz_id')
    .references(() => quiz.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  currentQuestion: integer('current_question').default(0),
  endTime: timestamp('end_time', { withTimezone: true }),
  score: integer('score').default(0),
  isSubmitted: boolean('is_submitted').default(false),
});

export const quizAnswer = pgTable('quiz_answer', {
  id: serial('id').primaryKey(),
  isFinal: boolean('is_final').default(false),
  isCorrect: boolean('is_correct').default(false),
  userId: integer('user_id')
    .references(() => user.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  quizAttemptId: integer('quiz_attempt_id')
    .references(() => quizAttempt.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  quizQuestionId: integer('quiz_question_id')
    .references(() => quizQuestion.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  answer: text('answer').notNull(),
  selectedOptionId: integer('selected_option_id').references(
    // in case of a multiple choice test, will have different logic
    () => quizOption.id,
    {
      onDelete: 'cascade',
    },
  ),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}); // TODO: implement partial points later (eg for multiple choice with multiple correct answers)

export const competitiveProgrammingContest = pgTable(
  'competitive_programming_contest',
  {
    matchupId: integer('matchup_id'),
    name: text('name').notNull(),
    id: serial('id').primaryKey(),
    description: text('description'),
    allowedLanguages: text('allowed_languages'), //csv of languages
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
);

export const contestAllowedLanguage = pgTable(
  'contest_allowed_language',
  {
    contestId: integer('contest_id')
      .references(() => competitiveProgrammingContest.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    language: text('language').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    // Primary key
  },
  (t) => ({
    pk: primaryKey({ columns: [t.contestId, t.language] }),
  }),
);

export const problem = pgTable('problem', {
  id: serial('id').primaryKey(),
  contestId: integer('contest_id')
    .references(() => competitiveProgrammingContest.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  inputFormat: text('input_format'),
  outputFormat: text('output_format'),
  constraints: text('constraints'),
  maxMilliseconds: integer('max_milliseconds').default(1000),
  maxMemory: integer('max_memory').default(256),
  sampleInput: text('sample_input'),
  sampleOutput: text('sample_output'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const testCluster = pgTable('test_cluster', {
  id: serial('id').primaryKey(),
  problemId: integer('problem_id')
    .references(() => problem.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const testClusterToProblem = pgTable(
  'test_cluster_problem',
  {
    problemId: integer('problem_id')
      .references(() => problem.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    testClusterId: integer('test_cluster_id')
      .references(() => testCluster.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    points: integer('points').default(10),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.problemId, t.testClusterId] }),
  }),
);

export const testcase = pgTable('testcase', {
  id: serial('id').primaryKey(),
  clusterId: integer('cluster_id')
    .references(() => testCluster.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  input: text('input').notNull(),
  expectedOutput: text('expected_output').notNull(),
  points: integer('points').default(5),
});

export const submission = pgTable('submission', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => user.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  problemId: integer('problem_id')
    .references(() => problem.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  code: text('code').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const submissionTestcase = pgTable(
  'submission_testcase',
  {
    submissionId: integer('submission_id')
      .references(() => submission.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    testClusterId: integer('test_case_cluster_id')
      .references(() => testCluster.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    status: submissionStatus('status').default('pending'),
    points: integer('points').default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.submissionId, t.testClusterId] }),
  }),
);
