"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ICreateLFGRequest } from "@tournament-app/types";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const createLFG = async (data: {
  message?: string;
  categoryIds?: number[];
}) => {
  data.categoryIds ??= [];
  return clientApi
    .post<ICreateLFGRequest, AxiosResponse>(`/lfg`, data)
    .then((res) => res.data);
};
export const useCreateLFG = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLFG,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully created LFG", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("lfg"),
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
      toast.addToast("creating LFG...", "info");
    },
  });
};
