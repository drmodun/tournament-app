"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IUpdateUserInfo } from "@tournament-app/types";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully updated user", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("me"),
      });
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("user"),
      });
    },
    onError: (error: any) => {
      toast.addToast("invalid credentials", "error");

      console.error(error);
    },
    onMutate: () => {
      toast.addToast("updating user...", "info");
    },
  });
};
