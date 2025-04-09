"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { ICreateTournamentRequest } from "@tournament-app/types";
import { invalidateCompetitions } from "./serverFetches";
import { handleError } from "utils/mixins/helpers";

export const createCompetition = async (data: ICreateTournamentRequest) =>
  clientApi
    .post<
      ICreateTournamentRequest,
      AxiosResponse<{ id: number }>
    >(`/tournaments`, data)
    .then((res) => res.data);

export const useCreateCompetition = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompetition,
    retryDelay: 5000,
    retry: 2,
    onSuccess: async () => {
      toast.addToast("successfully created competition", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("competition"),
      });
      invalidateCompetitions();
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("creating competition...", "info");
    },
  });
};
