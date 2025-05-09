"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ICreateScoreRequest } from "@tournament-app/types";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { invalidateMatchups } from "./serverFetches";
import { handleError } from "utils/mixins/helpers";

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
      invalidateMatchups();
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("creating the score...", "info");
    },
  });
};
