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

export const editCompetition = async (
  data: IUpdateTournamentRequest & { id?: number },
) => {
  const { id, ..._data } = data;
  console.log(_data);
  _data.locationId = 0;
  _data.categoryId = 0;
  return clientApi
    .patch<
      IUpdateTournamentRequest,
      AxiosResponse<{ id: number }>
    >(`/tournaments/${id}`, _data)
    .then((res) => res.data);
};

export const useEditCompetition = () => {
  const toast = useToastContext();

  return useMutation({
    mutationKey: ["me"],
    mutationFn: editCompetition,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    onSuccess: async (data) => {
      toast.addToast("successfully updated competition", "success");
    },
    onError: (error: any) => {
      toast.addToast(
        "an error occurred while updating the competition..",
        "error",
      );
      console.error(error);
      console.log(error.message);
    },
    onMutate: () => {
      toast.addToast("updating competition...", "info");
    },
  });
};
