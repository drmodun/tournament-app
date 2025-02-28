"use client";

import { useMutation } from "@tanstack/react-query";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { IUpdateTournamentRequest } from "@tournament-app/types";

export const createGroupParticipation = async (data: {
  id: number;
  groupId: number;
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

  return useMutation({
    mutationKey: ["me", "group", "participation"],
    mutationFn: createGroupParticipation,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    onSuccess: async (data) => {
      toast.addToast("successfully joined competition", "success");
    },
    onError: (error: any) => {
      toast.addToast("an error occurred...", "error");
      console.error(error);
      console.log(error.message);
    },
    onMutate: () => {
      toast.addToast("joining the competition...", "info");
    },
  });
};
