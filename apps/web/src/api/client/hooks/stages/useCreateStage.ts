"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ICreateStageDto,
  IUpdateTournamentRequest,
} from "@tournament-app/types";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { toastHandlers } from "api/client/toastHandlers";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { invalidateStages } from "./serverFetches";

export const createStage = async (data: ICreateStageDto) => {
  return clientApi
    .post<IUpdateTournamentRequest, AxiosResponse<{ id: number }>>(
      `/stages/${data.tournamentId}`,
      data,
    )
    .then((res) => res.data);
};

export const useCreateStage = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStage,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully created stage", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("stage"),
      });
      invalidateStages();
    },
    ...toastHandlers(toast, "creating the stage..."),
  });
};
