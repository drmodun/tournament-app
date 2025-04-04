"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ICreateScoreRequest } from "@tournament-app/types";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const deleteMatchupScore = async ({
  id,
  tournamentId,
}: {
  id?: number;
  tournamentId?: number;
}) => {
  return clientApi
    .delete<
      ICreateScoreRequest,
      AxiosResponse
    >(`/matches/${tournamentId}/${id}/delete-score`, { params: { matchupId: id, tournamentId: tournamentId } })
    .then((res) => res.data);
};

export const useDeleteMatchupScore = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMatchupScore,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully deleted score", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("matchup"),
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
      toast.addToast("deleting the score...", "info");
    },
  });
};
