"use client";

import { notificationTypeEnum } from "@tournament-app/types";

export interface INotificationBase {
  id: number;
  message: string;
  link: string | null;
  image: string | null;
  type: notificationTypeEnum;
  createdAt: string;
}

export interface INotificationResponse {
  notification: INotificationBase;
  isRead: boolean;
}

export interface NotificationQueryParams {
  isRead?: boolean;
  type?: notificationTypeEnum;
  page?: number;
  pageSize?: number;
  order?: "asc" | "desc";
}

export interface INotificationEvent {
  data: INotificationBase;
  type: string;
}

export interface NotificationContextType {
  notifications: INotificationResponse[];
  unreadCount: number;
  token: string | null;
  isConnected: boolean;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markBulkAsRead: (ids: number[]) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  refreshToken: () => Promise<void>;
}
