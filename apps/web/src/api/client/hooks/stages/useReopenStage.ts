"use client";

import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useApiMutation } from "api/client/useApiMutation";

export const reopenStage = async (stageId?: number) => {
  return clientApi
    .post<never, AxiosResponse<{ id: number }>>(`/stages/${stageId}/reopen`)
    .then((res) => res.data);
};

export const useReopenStage = () =>
  useApiMutation({
    mutationFn: (stageId: number) => reopenStage(stageId),
    size: "small",
    pending: "reopening the stage...",
    success: "stage reopened, its results can be corrected",
    invalidate: ["stage"],
  });
