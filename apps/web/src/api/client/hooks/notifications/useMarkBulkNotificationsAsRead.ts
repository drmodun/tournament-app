"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markBulkNotificationsAsRead } from "./serverFetches";
import { INotificationResponse } from "./types";

export const useMarkBulkNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => markBulkNotificationsAsRead(ids),
    onSuccess: (_, ids) => {
      queryClient.setQueriesData(
        { queryKey: ["notifications"] },
        (oldData: any) => {
          if (!oldData) return oldData;

          if (Array.isArray(oldData)) {
            return oldData.map((notification: INotificationResponse) =>
              ids.includes(notification.notification.id)
                ? { ...notification, isRead: true }
                : notification,
            );
          }

          return oldData;
        },
      );

      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
