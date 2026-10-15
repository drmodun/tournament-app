"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { toastHandlers } from "api/client/toastHandlers";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { IUpdateTournamentRequest } from "@tournament-app/types";
import { invalidateCompetitions } from "./serverFetches";

export const editCompetition = async (
  data: IUpdateTournamentRequest & { id?: number; categoryId?: number },
) => {
  const { id, categoryId, ..._data } = data;
  if (categoryId != -1 && categoryId !== undefined) {
    (_data as any).categoryId = categoryId;
  }
  return clientApi
    .patch<IUpdateTournamentRequest, AxiosResponse<{ id: number }>>(
      `/tournaments/${id}`,
      _data,
    )
    .then((res) => res.data);
};

export const useEditCompetition = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editCompetition,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully updated competition", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("competition"),
      });
      invalidateCompetitions();
    },
    ...toastHandlers(toast, "updating competition..."),
  });
};
