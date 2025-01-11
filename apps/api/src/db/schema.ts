import {
  betStatusEnum,
  betTypeEnum,
  chatRoomTypeEnum,
  eventStatusEnum,
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
} from '@tournament-app/types';
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
} from 'drizzle-orm/pg-core';

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

export const matchupType = pgEnum(
  'matchup_type',
  exportEnumValues(matchupTypeEnum),
);

export const likeType = pgEnum('like_type', exportEnumValues(likeTypeEnum));

export const tournamentLocation = pgEnum(
  'tournament_location',
  exportEnumValues(tournamentLocationEnum),
);

export const eventStatus = pgEnum(
  'event_status',
  exportEnumValues(eventStatusEnum),
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

export const user = pgTable('user', {
  id: serial('id').unique().primaryKey(),
  name: text('name').notNull(),
  username: text('username').notNull(),
  profilePicture: text('profile_picture'),
  bio: text('bio').default('A user on the tournament app platform'),
  email: text('email').notNull().unique(),
  password: text('password'), //hashed password
  role: userRole('role').default('user'),
  code: text('code')
    .$defaultFn(() => Math.random().toString(36).slice(8))
    .unique(),
  isEmailVerified: boolean('is_email_verified').default(false),
  hasSelectedInterests: boolean('has_selected_interests').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()), //TODO: see if there is a better alternative
  country: text('country'), //TODO: possibly setup enum
  location: text('location'),
  stripeCustomerId: text('stripe_customer_id'),
  bettingPoints: integer('betting_points').default(100),
  customerId: text('customer_id'),
  level: integer('level').default(1),
});

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

export const subscription = pgTable('subscription', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  enum: userSubscription('enum'), //TODO: potentially remove
  description: text('description'),
  benefits: text('benefits'),
  stripeProductId: text('stripe_product_id'),
  price: integer('price').notNull(), //price in cents euro
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

export const tournament = pgTable('tournament', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  tournamentLocation: tournamentLocation('tournament_location').default(
    'online',
  ),
  country: text('country'),
  minimumLevel: integer('minimum_level').default(1),
  logo: text('logo'),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  isPublic: boolean('is_public').default(true),
  links: text('links'), //csv of links
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  tournamentType: tournamentType('tournament_type').default('league'),
  minimumMMR: integer('minimum_mmr').default(0),
  maximumMMR: integer('maximum_mmr').default(3000),
  location: text('location'),
  maxParticipants: integer('max_participants').default(32),
  categoryId: integer('category_id')
    .references(() => category.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  subcategory: integer('subcategory_id').references(() => subcategory.id), // Maybe change this to one-to-many
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

//TODO: add rewards

export const organizer = pgTable(
  'organizer',
  {
    userId: integer('user_id')
      .references(() => user.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    tournamentId: integer('tournament_id')
      .references(() => tournament.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    role: organizerRole('role').default('moderator'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.tournamentId] }),
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

export const group = pgTable('group', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  abbreviation: text('abbreviation').notNull(),
  description: text('description'),
  logo: text('logo'),
  country: text('country'),
  location: text('location'),
  type: groupType('group_type').default('public'),
  focus: groupFocus('group_focus').default('hybrid'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  chatRoomId: integer('chat_room_id').references(() => chatRoom.id),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  //TODO: if needed create a separate settings entity
});

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
  }, // TODO: the response to this is literally creating another group membership or just straight up deleting the join request
  (t) => ({
    pk: primaryKey({ columns: [t.groupId, t.userId] }),
  }),
);

export const category = pgTable('category', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  image: text('image'),
  type: categoryType('category_type').default('other'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

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

export const participation = pgTable(
  'participation',
  {
    groupId: integer('group_id')
      .references(() => group.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    tournamentId: integer('tournament_id')
      .references(() => tournament.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    points: integer('points').default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.groupId, t.tournamentId] }),
  }),
);

export const event = pgTable('event', {
  id: serial('id').primaryKey(),
  tournamentId: integer('tournament_id').references(() => tournament.id, {
    onDelete: 'cascade',
  }),
  eventStatus: eventStatus('event_status').default('upcoming'), //TODO: maybe run a cron job to update this
  eventType: text('event_type').default('group'),
  name: text('name').notNull(),
  eventLocation: tournamentLocation('event_location').default('online'),
  description: text('description'),
  logo: text('logo'),
  chatRoomId: integer('chat_room_id').references(() => chatRoom.id),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  minPlayersPerTeam: integer('min_players_per_team').default(1),
  maxPlayersPerTeam: integer('max_players_per_team'),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const roster = pgTable('roster', {
  id: serial('id').primaryKey(), //Multiple teams per group allowed
  groupId: integer('group_id').references(() => group.id, {
    onDelete: 'cascade',
  }),
  eventId: integer('event_id')
    .references(() => event.id, {
      onDelete: 'cascade',
    })
    .notNull(),
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
    pointDifference: integer('point_difference').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    isSubstitute: boolean('is_substitute').default(false),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.rosterId] }),
  }),
);

export const matchup = pgTable('matchup', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id')
    .references(() => event.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  matchupType: matchupType('matchup_type').default('one_vs_one'),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
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
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    points: integer('points').default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.rosterId, t.matchupId] }),
  }),
); //TODO: see how to implement detailed results for series matches

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
    matchmakingPoints: integer('matchmaking_points').default(1000),
    level: integer('level').default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.categoryId, t.userId] }),
  }),
);

export const notification = pgTable('notification', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => user.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  message: text('message').notNull(),
  type: notificationType('type').default('info'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  read: boolean('read').default(false),
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
  message: text('message').notNull(),
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

export const resultPost = pgTable('result_post', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => user.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  eventId: integer('event_id')
    .references(() => event.id, {
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
    eventId: integer('event_id').references(() => event.id, {
      onDelete: 'cascade',
    }),
    review: text('review').notNull(),
    isHidden: boolean('is_hidden').default(false),
    rating: integer('rating').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.eventId] }),
  }),
);

export const quiz = pgTable('quiz', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  description: text('description'),
  isTest: boolean('is_test').default(false), //If it is a test, you can see all questions at once and move back and forth
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  matchupId: integer('matchup_id').references(() => matchup.id),
});

export const quizQuestion = pgTable('quiz_question', {
  id: serial('id').primaryKey(),
  quizId: integer('quiz_id')
    .references(() => quiz.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  question: text('question').notNull(), //question should be saved as markdown
  correctAnswer: text('correct_answer').notNull(),
  points: integer('points').default(5),
  type: quizQuestionType('type').default('multiple_choice'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const quizAnswer = pgTable('quiz_answer', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => user.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  quizQuestionId: integer('quiz_question_id')
    .references(() => quizQuestion.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  answer: text('answer').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

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
    language: text('language').notNull(), // TODO: make this into an enum
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

//TODO: add country table
//TODO: check if making roster for one player even makes sense or should it be switched with userId
