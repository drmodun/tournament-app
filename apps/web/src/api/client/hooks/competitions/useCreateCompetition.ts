"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { ICreateTournamentRequest } from "@tournament-app/types";

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
    },
    onError: (error: any) => {
      toast.addToast(
        "an error occurred while creating the competition..",
        "error",
      );
      console.error(error);
      console.log(error.message);
    },
    onMutate: () => {
      toast.addToast("creating competition...", "info");
    },
  });
};
