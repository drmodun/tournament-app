"use client";

import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useSseNotifications } from "api/client/hooks/notifications/useSseNotifications";
import { useGetNotifications } from "api/client/hooks/notifications/useGetNotifications";
import { useMarkNotificationAsRead } from "api/client/hooks/notifications/useMarkNotificationAsRead";
import { useMarkAllNotificationsAsRead } from "api/client/hooks/notifications/useMarkAllNotificationsAsRead";
import { useMarkBulkNotificationsAsRead } from "api/client/hooks/notifications/useMarkBulkNotificationsAsRead";
import { useDeleteNotification } from "api/client/hooks/notifications/useDeleteNotification";
import { useRequestNotificationToken } from "api/client/hooks/notifications/useRequestNotificationToken";
import {
  INotificationBase,
  INotificationResponse,
  NotificationContextType,
} from "api/client/hooks/notifications/types";
import { getAccessToken } from "api/client/base";
import { useAuth } from "api/client/hooks/auth/useAuth";

// Create the context with default values
export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  token: null,
  isConnected: false,
  isLoading: false,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  markBulkAsRead: async () => {},
  deleteNotification: async () => {},
  refreshToken: async () => {},
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<INotificationResponse[]>(
    [],
  );
  const [token, setToken] = useState<string | null>(null);

  const {
    data: fetchedNotifications,
    refetch,
    isLoading,
  } = useGetNotifications({
    order: "desc",
    page: 1,
    pageSize: 50,
  });

  const { isConnected } = useSseNotifications(token);
  const { data: authData } = useAuth();

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const markBulkAsReadMutation = useMarkBulkNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const requestTokenMutation = useRequestNotificationToken();

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  useEffect(() => {
    if (fetchedNotifications) {
      setNotifications(fetchedNotifications);
    }
  }, [fetchedNotifications]);

  const refreshToken = useCallback(async () => {
    if (!getAccessToken()) return;

    try {
      const data = await requestTokenMutation.mutateAsync();
      setToken(data.sseToken);
    } catch (error) {
      console.error("Error requesting notification token:", error);
    }
  }, [requestTokenMutation]);

  useEffect(() => {
    if (authData) {
      refreshToken();
    }
  }, [authData]);

  const fetchNotifications = useCallback(async () => {
    await refetch();
  }, [refetch]);

  useEffect(() => {
    const handleNewNotification = (event: Event) => {
      const customEvent = event as CustomEvent<INotificationBase>;
      const newNotification = customEvent.detail;

      setNotifications((prev) => [
        {
          notification: newNotification,
          isRead: false,
        },
        ...prev,
      ]);

      refetch();
    };

    window.addEventListener("new-notification", handleNewNotification);

    return () => {
      window.removeEventListener("new-notification", handleNewNotification);
    };
  }, [refetch]);

  const markAsRead = useCallback(
    async (id: number) => {
      await markAsReadMutation.mutateAsync(id);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.notification.id === id
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    },
    [markAsReadMutation],
  );

  const markAllAsRead = useCallback(async () => {
    await markAllAsReadMutation.mutateAsync();

    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
  }, [markAllAsReadMutation]);

  const markBulkAsRead = useCallback(
    async (ids: number[]) => {
      await markBulkAsReadMutation.mutateAsync(ids);

      setNotifications((prev) =>
        prev.map((notification) =>
          ids.includes(notification.notification.id)
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    },
    [markBulkAsReadMutation],
  );

  const handleDeleteNotification = useCallback(
    async (id: number) => {
      await deleteNotificationMutation.mutateAsync(id);

      setNotifications((prev) =>
        prev.filter((notification) => notification.notification.id !== id),
      );
    },
    [deleteNotificationMutation],
  );

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    token,
    isConnected,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    markBulkAsRead,
    deleteNotification: handleDeleteNotification,
    refreshToken,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
