"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import {
  ICreateRosterRequest,
  IUpdateTournamentRequest,
} from "@tournament-app/types";
import { useAuth } from "../auth/useAuth";

export const createRoster = async (data: {
  participationId?: number;
  stageId?: number;
  members?: { userId?: number; isSubstitute?: boolean }[];
}) => {
  return clientApi
    .post<
      ICreateRosterRequest,
      AxiosResponse<{ id: number }>
    >(`/roster/${data.participationId}/${data.stageId}`, { members: data.members })
    .then((res) => res.data);
};

export const useCreateRoster = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoster,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    onSuccess: async (data) => {
      toast.addToast("successfully created roster", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("roster"),
      });
    },
    onError: (error: any) => {
      toast.addToast("an error occurred...", "error");
      console.error(error);
      console.log(error.message);
    },
    onMutate: () => {
      toast.addToast("creating the roster...", "info");
    },
  });
};
