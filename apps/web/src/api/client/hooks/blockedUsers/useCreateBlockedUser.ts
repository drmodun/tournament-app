"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const createBlockedUser = async (data: {
  groupId?: number;
  userId?: number;
}) => {
  return clientApi
    .post<never, AxiosResponse>(
      `/blocked-users/${data?.groupId}/${data?.userId}`,
      {
        params: {
          groupId: data?.groupId,
          userId: data?.userId,
        },
      },
    )
    .then((res) => res.data);
};
export const useCreatedBlockedUser = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBlockedUser,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async (data, variables) => {
      toast.addToast("successfully blocked user", "success");
      await queryClient.invalidateQueries({
        queryKey: ["lfg", "team", variables.groupId],
      });

      return true;
    },
    onError: (error: any) => {
      toast.addToast(error.message ?? "an error occurred...", "error");
      console.error(error);
      return false;
    },
    onMutate: () => {
      toast.addToast("blocking user...", "info");
    },
  });
};
