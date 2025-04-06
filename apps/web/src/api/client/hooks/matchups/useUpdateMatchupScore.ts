"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IEndMatchupRequest } from "@tournament-app/types";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

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
    >(`/matches/${id}/update-score`, { params: { matchupId: id }, data: data })
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
      toast.addToast("updating the score...", "info");
    },
  });
};
