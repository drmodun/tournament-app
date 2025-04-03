"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IUpdateTournamentRequest } from "@tournament-app/types";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const createGroupParticipation = async (data: {
  id: number;
  groupId: number;
  userId: number;
}) => {
  return clientApi
    .post<
      IUpdateTournamentRequest,
      AxiosResponse<{ id: number }>
    >(`/participations/apply-group/${data.id}/${data.groupId}`, { params: { tournamentId: data.id, groupId: data.groupId } })
    .then((res) => res.data);
};

export const useCreateGroupParticipation = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroupParticipation,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully joined competition", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("participation"),
      });
    },
    onError: (error: any) => {
      toast.addToast(error.message ?? "an error occurred...", "error");
      console.error(error);
      console.log(error.message);
    },
    onMutate: () => {
      toast.addToast("joining the competition...", "info");
    },
  });
};
