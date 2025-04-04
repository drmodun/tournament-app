"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IUpdateStageDto } from "@tournament-app/types";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const updateStage = async (
  data: {
    data: IUpdateStageDto;
    stageId?: number;
  },
  tournamentId?: number,
) => {
  const { tournamentId: stageDataTournamentId, ..._data } = data.data;

  return clientApi
    .patch<
      IUpdateStageDto,
      AxiosResponse<{ id: number }>
    >(`/stages/${tournamentId}/${data.stageId}`, { ..._data, params: { stageId: data?.stageId, tournamentId: tournamentId || stageDataTournamentId } })
    .then((res) => res.data);
};

export const useUpdateStage = (tournamentId?: number) => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { data: IUpdateStageDto; stageId?: number }) =>
      updateStage(data, tournamentId),
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully updated stage", "success");
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
      toast.addToast("updating the stage...", "info");
    },
  });
};
