"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IUpdateTournamentRequest } from "@tournament-app/types";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { handleError } from "utils/mixins/helpers";

export const createSoloParticipation = async (id: number) => {
  return clientApi
    .post<
      IUpdateTournamentRequest,
      AxiosResponse<{ id: number }>
    >(`/participations/apply-solo/${id}`, { params: { tournamentId: id } })
    .then((res) => res.data);
};

export const useCreateSoloParticipation = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSoloParticipation,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully joined competition", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("participation"),
      });
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("joining the competition...", "info");
    },
  });
};
