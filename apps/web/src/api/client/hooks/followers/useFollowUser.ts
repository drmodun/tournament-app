"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { IExtendedUserResponse } from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const followUser = async (userId: number) =>
  clientApi
    .post<never, AxiosResponse>(`/followers/${userId}`)
    .then((res) => res.data);

export const useFollowUser = () => {
  const toast = useToastContext();

  return useMutation({
    mutationKey: ["me"],
    mutationFn: followUser,
    retryDelay: 10000,
    onSuccess: async (data) => {
      toast.addToast("successfully followed user", "success");
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
