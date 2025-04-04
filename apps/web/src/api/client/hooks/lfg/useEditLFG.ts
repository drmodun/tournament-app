"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IUpdateLFGRequest } from "@tournament-app/types";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const UpdateLFG = async (data: {
  message?: string;
  categoryIds?: number[];
  id?: number;
}) => {
  const { id, message, categoryIds } = data;
  const updateData = { message, categoryIds: categoryIds ?? [] };
  return clientApi
    .patch<IUpdateLFGRequest, AxiosResponse>(`/lfg/${id}`, updateData)
    .then((res) => res.data);
};
export const useUpdateLFG = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: UpdateLFG,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully updated LFG", "success");
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
        "error"
      );
      console.error(error);
      return false;
    },
    onMutate: () => {
      toast.addToast("updating LFG...", "info");
    },
  });
};
