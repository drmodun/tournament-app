"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { IExtendedUserResponse, IUpdateUserInfo } from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const updateUser = async (updateFields: IUpdateUserInfo) => {
  return clientApi
    .patch<never, AxiosResponse<IUpdateUserInfo>>(`/users`, updateFields)
    .then((res) => res.data);
};

export const useUpdateUser = () => {
  const toast = useToastContext();
  return useMutation({
    mutationKey: ["me"],
    mutationFn: updateUser,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    onSuccess: async (data) => {
      toast.addToast("successfully updated user", "success");
    },
    onError: (error: any) => {
      toast.addToast("invalid credentials", "error"); //TODO: maybe make this show the server error message, or just log it
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("updating user...", "info");
    },
  });
};
