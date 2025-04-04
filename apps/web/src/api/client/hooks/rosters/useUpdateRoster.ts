"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ICreateRosterRequest,
  IUpdateRosterMemberRequest,
} from "@tournament-app/types";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const editRoster = async (data: {
  id?: number;
  members?: { userId?: number; isSubstitute?: boolean }[];
}) => {
  console.log(data);
  return clientApi
    .patch<
      ICreateRosterRequest,
      AxiosResponse<{ id: number }>
    >(`/roster/${data.id}`, { members: data.members })
    .then((res) => res.data);
};

export const useEditRoster = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editRoster,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully updated roster", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("roster"),
      });
    },
    onError: (error: any) => {
      toast.addToast(
        error.response?.data?.message ??
          error.message ??
          "an error occurred...",
        "error"
      );
      console.error(error);
      console.log(error.message);
    },
    onMutate: () => {
      toast.addToast("updating the roster...", "info");
    },
  });
};
