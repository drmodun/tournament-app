"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IExtendedUserResponse } from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
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
    onSuccess: async (data) => {
      toast.addToast("successfully unfollowed user", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("follower"),
      });
      return true;
    },
    onError: (error: any) => {
      toast.addToast("an error occurred while unfollowing the user..", "error");
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("unfollowing user...", "info");
    },
  });
};
