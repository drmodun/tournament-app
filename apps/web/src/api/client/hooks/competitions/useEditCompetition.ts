"use client";

import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { IUpdateTournamentRequest } from "@tournament-app/types";
import { invalidateCompetitions } from "./serverFetches";
import { useApiMutation } from "api/client/useApiMutation";

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

export const useEditCompetition = () =>
  useApiMutation({
    mutationFn: editCompetition,
    size: "medium",
    pending: "updating competition...",
    success: "successfully updated competition",
    invalidate: ["competition"],
    afterSuccess: invalidateCompetitions,
  });
