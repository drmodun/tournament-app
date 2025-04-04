"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationAsRead } from "./serverFetches";
import { INotificationResponse } from "./types";

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markNotificationAsRead(id),
    onSuccess: (_, id) => {
      // Update the cache to mark the notification as read
      queryClient.setQueriesData(
        { queryKey: ["notifications"] },
        (oldData: any) => {
          if (!oldData) return oldData;

          // If the data is an array, update it directly
          if (Array.isArray(oldData)) {
            return oldData.map((notification: INotificationResponse) =>
              notification.notification.id === id
                ? { ...notification, isRead: true }
                : notification
            );
          }

          // For paginated data or other formats
          return oldData;
        }
      );

      // Invalidate queries to refetch if needed
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
