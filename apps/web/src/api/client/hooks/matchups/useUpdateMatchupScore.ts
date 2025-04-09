"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IEndMatchupRequest } from "@tournament-app/types";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { invalidateMatchups } from "./serverFetches";
import { handleError } from "utils/mixins/helpers";

export const createMatchupScore = async ({
  id,
  data,
}: {
  id?: number;
  data?: IEndMatchupRequest;
}) => {
  return clientApi
    .put<
      IEndMatchupRequest,
      AxiosResponse
    >(`/matches/${id}/update-score`, { ...data })
    .then((res) => res.data);
};

export const useUpdateMatchScore = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMatchupScore,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully updated score", "success");
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
      toast.addToast("updating the score...", "info");
    },
  });
};
