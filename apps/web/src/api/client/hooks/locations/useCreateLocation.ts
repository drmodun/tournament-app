"use client";

import { useMutation } from "@tanstack/react-query";
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

  return useMutation({
    mutationKey: ["me"],
    mutationFn: createLocation,
    retryDelay: 2000,
    retry: 3,
  });
};
