import { NotificationCreateDto } from '../../types';
import { notificationTypeEnum } from '@tournament-app/types';

export const createNotificationExample: {
  notification: NotificationCreateDto;
  userIds: number[];
} = {
  notification: {
    type: notificationTypeEnum.TOURNAMENT_START,
    message: 'Your tournament is starting now!',
    link: '/tournaments/123',
    image: 'https://example.com/tournament-image.jpg',
  },
  userIds: [1, 2, 3, 4, 5],
};

export const bulkReadExample = {
  ids: [1, 2, 3, 4, 5],
};

export const notificationQueryExample = {
  userId: 1,
  isRead: false,
  type: notificationTypeEnum.TOURNAMENT_START,
  page: 1,
  pageSize: 10,
  order: 'desc',
};

export const notificationResponseExample = {
  notification: {
    id: 1,
    message: 'Your tournament is starting now!',
    link: '/tournaments/123',
    image: 'https://example.com/tournament-image.jpg',
    type: notificationTypeEnum.TOURNAMENT_START,
    createdAt: new Date().toISOString(),
  },
  isRead: false,
};

export const notificationListResponseExample = [
  {
    notification: {
      id: 1,
      message: 'Your tournament is starting now!',
      link: '/tournaments/123',
      image: 'https://example.com/tournament-image.jpg',
      type: notificationTypeEnum.TOURNAMENT_START,
      createdAt: new Date().toISOString(),
    },
    isRead: false,
  },
  {
    notification: {
      id: 2,
      message: 'New message in your group',
      link: '/groups/456/chat',
      image: 'https://example.com/group-chat.jpg',
      type: notificationTypeEnum.GROUP_INVITATION,
      createdAt: new Date().toISOString(),
    },
    isRead: true,
  },
  {
    notification: {
      id: 3,
      message: 'You have been invited to join a tournament',
      link: '/tournaments/789/join',
      image: 'https://example.com/tournament-invite.jpg',
      type: notificationTypeEnum.TOURNAMENT_REMINDER,
      createdAt: new Date().toISOString(),
    },
    isRead: false,
  },
];

export const sseEventExample = {
  data: {
    type: notificationTypeEnum.TOURNAMENT_START,
    message: 'Your tournament is starting now!',
    link: '/tournaments/123',
    image: 'https://example.com/tournament-image.jpg',
  },
  type: 'notification',
};

export const tokenResponseExample = {
  id: 1,
  sseToken: '1234567890-abcdef-1234567890',
};
