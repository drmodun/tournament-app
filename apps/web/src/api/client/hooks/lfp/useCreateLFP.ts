"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ICreateLFPRequest } from "@tournament-app/types";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const createLFP = async (data: { groupId?: number; message?: string }) =>
  clientApi
    .post<ICreateLFPRequest, AxiosResponse>(`/lfp/${data?.groupId}`, {
      message: data?.message,
      params: {
        groupId: data?.groupId,
      },
    })
    .then((res) => res.data);

export const useCreateLFP = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLFP,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully created LFP", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("lfp"),
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
      toast.addToast("creating LFP...", "info");
    },
  });
};
