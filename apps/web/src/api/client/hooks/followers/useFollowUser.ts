"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const followUser = async (userId: number) =>
  clientApi
    .post<never, AxiosResponse>(`/followers/${userId}`)
    .then((res) => res.data);

export const useFollowUser = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followUser,
    retryDelay: 10000,
    onSuccess: async () => {
      toast.addToast("successfully followed user", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("follower"),
      });
    },
    onError: (error: any) => {
      toast.addToast("an error occurred while following the user..", "error");
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("following user...", "info");
    },
  });
};
