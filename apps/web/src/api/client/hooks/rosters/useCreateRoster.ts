"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ICreateRosterRequest } from "@tournament-app/types";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { invalidateRosters } from "./serverFetches";
import { handleError } from "utils/mixins/helpers";

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
    onSuccess: async () => {
      toast.addToast("successfully created roster", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("roster"),
      });
      invalidateRosters();
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("creating the roster...", "info");
    },
  });
};
