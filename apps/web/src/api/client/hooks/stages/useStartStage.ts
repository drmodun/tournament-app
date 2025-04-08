"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const startStage = async (stageId?: number) => {
  return clientApi
    .patch<never, AxiosResponse<{ id: number }>>(`/stages/start/${stageId}`)
    .then((res) => res.data);
};

export const useStartStage = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stageId: number) => startStage(stageId),
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully started stage", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("stage"),
      });
    },
    onError: (error: any) => {
      toast.addToast(
        error.response?.data?.message ??
          error.message ??
          "an error occurred...",
        "error",
      );
      console.error(error);
      console.log(error.message);
    },
    onMutate: () => {
      toast.addToast("starting the stage...", "info");
    },
  });
};
