"use client";

import { useMutation } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { useAuth } from "../auth/useAuth";
import {
  ICreateTournamentRequest,
  ITournamentResponse,
} from "@tournament-app/types";

export const createCompetition = async (data: ICreateTournamentRequest) =>
  clientApi
    .post<never, AxiosResponse<{ id: number }>>(`/tournaments`, { body: data })
    .then((res) => res.data);

export const useCreateCompetition = () => {
  const toast = useToastContext();

  return useMutation({
    mutationKey: ["me"],
    mutationFn: createCompetition,
    retryDelay: 10000,
    retry: 3,
    onSuccess: async (data) => {
      toast.addToast("successfully created competition", "success");
    },
    onError: (error: any) => {
      toast.addToast(
        "an error occurred while creating the competition..",
        "error",
      );
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("creating competition...", "info");
    },
  });
};
