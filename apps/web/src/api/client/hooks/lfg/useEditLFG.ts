"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IUpdateLFGRequest } from "@tournament-app/types";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { handleError } from "utils/mixins/helpers";

export const UpdateLFG = async (data: {
  message?: string;
  categoryIds?: number[];
  id?: number;
}) => {
  console.log("category ids", data.categoryIds ?? []);
  return clientApi
    .patch<
      IUpdateLFGRequest,
      AxiosResponse
    >(`/lfg/${data.id}`, { id: data.id, categoryIds: data?.categoryIds ?? [], message: data?.message })
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
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("updating LFG...", "info");
    },
  });
};
