"use client";

import { useMutation } from "@tanstack/react-query";
import { clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { useAuth } from "../auth/useAuth";
import {
  ICreateTournamentRequest,
  ITournamentResponse,
} from "@tournament-app/types";

export const createCompetition = async (data: ICreateTournamentRequest) =>
  clientApi
    .post<
      ICreateTournamentRequest,
      AxiosResponse<{ id: number }>
    >(`/tournaments`, data)
    .then((res) => res.data);

export const createCompetitionFetch = (data: ICreateTournamentRequest) => {
  return fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500"}/tournaments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(data),
    },
  );
};

export const useCreateCompetition = () => {
  const toast = useToastContext();

  return useMutation({
    mutationKey: ["me"],
    mutationFn: createCompetition,
    retryDelay: 5000,
    retry: 2,
    onSuccess: async (data) => {
      toast.addToast("successfully created competition", "success");
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
