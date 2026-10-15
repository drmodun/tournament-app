"use client";

import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useApiMutation } from "api/client/useApiMutation";

export const startStage = async (stageId?: number) => {
  return clientApi
    .patch<never, AxiosResponse<{ id: number }>>(`/stages/start/${stageId}`)
    .then((res) => res.data);
};

export const useStartStage = () =>
  useApiMutation({
    mutationFn: (stageId: number) => startStage(stageId),
    size: "small",
    pending: "starting the stage...",
    success: "successfully started stage",
    invalidate: ["stage"],
  });
