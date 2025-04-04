"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const unfollowUser = async (userId: number) =>
  clientApi
    .delete<never, AxiosResponse>(`/followers/${userId}`)
    .then((res) => res.data);

export const useUnfollowUser = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfollowUser,
    retryDelay: 10000,
    onSuccess: async () => {
      toast.addToast("successfully unfollowed user", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("follower"),
      });
      return true;
    },
    onError: (error: any) => {
      toast.addToast(
        error.response?.data?.message ??
          error.message ??
          "an error occurred...",
        "error"
      );
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("unfollowing user...", "info");
    },
  });
};
