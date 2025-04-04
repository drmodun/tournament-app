"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNotification } from "./serverFetches";
import { INotificationResponse } from "./types";

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: (_, id) => {
      queryClient.setQueriesData(
        { queryKey: ["notifications"] },
        (oldData: any) => {
          if (!oldData) return oldData;

          if (Array.isArray(oldData)) {
            return oldData.filter(
              (notification: INotificationResponse) =>
                notification.notification.id !== id,
            );
          }

          return oldData;
        },
      );

      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
