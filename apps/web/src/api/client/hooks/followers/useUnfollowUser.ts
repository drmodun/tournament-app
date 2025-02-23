"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
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

  return useMutation({
    mutationKey: ["me"],
    mutationFn: unfollowUser,
    retryDelay: 10000,
    onSuccess: async (data) => {
      toast.addToast("successfully unfollowed user", "success");
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
