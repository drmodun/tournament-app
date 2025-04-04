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

export const updateMatchupScore = async ({
  id,
  tournamentId,
  data,
}: {
  id?: number;
  tournamentId?: number;
  data?: ICreateScoreRequest;
}) => {
  return clientApi
    .patch<
      ICreateScoreRequest,
      AxiosResponse
    >(`/matches/${tournamentId}/${id}/score`, { params: { matchupId: id, tournamentId: tournamentId }, data: data })
    .then((res) => res.data);
};

export const useUpdateMatchupScore = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMatchupScore,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully created score", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("matchup"),
      });
    },
    onError: (error: any) => {
      toast.addToast(error.message ?? "an error occurred...", "error");
      console.error(error);
      console.log(error.message);
    },
    onMutate: () => {
      toast.addToast("creating the score...", "info");
    },
  });
};
