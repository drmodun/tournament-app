"use client";

import { useMutation } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { useAuth } from "../auth/useAuth";

// TODO: IMPLEMENT AFTER COMPETITION API IS IMPLEMENTED
export const joinCompetition = async (
  competitionId: number,
  userId: number | undefined,
) => clientApi.post<never, AxiosResponse>(`/CHANGE`).then((res) => res.data);

export const useJoinCompetition = (competitionId: number) => {
  const toast = useToastContext();
  const { data } = useAuth();

  return useMutation({
    mutationKey: ["me"],
    mutationFn: () => joinCompetition(competitionId, data?.id),
    retryDelay: 10000,
    onSuccess: async (data) => {
      toast.addToast("successfully joined competition", "success");
    },
    onError: (error: any) => {
      toast.addToast(
        "an error occurred while joining the competition..",
        "error",
      );
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("joining competition...", "info");
    },
  });
};
