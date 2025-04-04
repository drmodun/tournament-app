"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAllNotificationsAsRead } from "./serverFetches";

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      // Update the cache to mark all notifications as read
      queryClient.setQueriesData(
        { queryKey: ["notifications"] },
        (oldData: any) => {
          if (!oldData) return oldData;

          // If the data is an array, update it directly
          if (Array.isArray(oldData)) {
            return oldData.map((notification) => ({
              ...notification,
              isRead: true,
            }));
          }

          // For paginated data or other formats
          return oldData;
        },
      );

      // Invalidate queries to refetch if needed
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
