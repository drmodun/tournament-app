"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const createGroupInterest = async (
  groupId?: number,
  categoryId?: number,
) => {
  return clientApi
    .post<never, AxiosResponse>(`/group-interests/${groupId}/${categoryId}`, {
      params: {
        categoryId,
      },
    })
    .then((res) => res.data);
};

export const useCreateGroupInterest = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroupInterest,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully created interest", "success");
      await queryClient.invalidateQueries({
        queryKey: ["interest"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["lfp"],
      });
      return true;
    },
    onError: (error: any) => {
      toast.addToast(
        error.response?.data?.message ??
          error.message ??
          "an error occurred...",
        "error",
      );
      console.error(error);
      return false;
    },
    onMutate: () => {
      toast.addToast("creating interest...", "info");
    },
  });
};
