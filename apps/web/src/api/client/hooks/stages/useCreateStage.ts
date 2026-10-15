"use client";

import {
  ICreateStageDto,
  IUpdateTournamentRequest,
} from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { invalidateStages } from "./serverFetches";
import { useApiMutation } from "api/client/useApiMutation";

export const createStage = async (data: ICreateStageDto) => {
  return clientApi
    .post<IUpdateTournamentRequest, AxiosResponse<{ id: number }>>(
      `/stages/${data.tournamentId}`,
      data,
    )
    .then((res) => res.data);
};

export const useCreateStage = () =>
  useApiMutation({
    mutationFn: createStage,
    size: "medium",
    pending: "creating the stage...",
    success: "successfully created stage",
    invalidate: ["stage"],
    afterSuccess: invalidateStages,
  });
