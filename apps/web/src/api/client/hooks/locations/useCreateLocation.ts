"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { useAuth } from "../auth/useAuth";
import {
  ICreateLocationRequest,
  ICreateTournamentRequest,
  ITournamentResponse,
} from "@tournament-app/types";

export const createLocation = async (data: ICreateLocationRequest) =>
  clientApi
    .post<
      ICreateLocationRequest,
      AxiosResponse<{ id: number }>
    >(`/locations`, data)
    .then((res) => res.data);

export const useCreateLocation = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLocation,
    retryDelay: 2000,
    retry: 3,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("location"),
      });
    },
  });
};
