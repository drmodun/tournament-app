"use client";

import { IEndMatchupRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { invalidateMatchups } from "./serverFetches";
import { useApiMutation } from "api/client/useApiMutation";

export const createMatchupScore = async ({
  id,
  data,
}: {
  id?: number;
  data?: IEndMatchupRequest;
}) => {
  return clientApi
    .put<IEndMatchupRequest, AxiosResponse>(`/matches/${id}/update-score`, {
      ...data,
    })
    .then((res) => res.data);
};

export const useUpdateMatchScore = () =>
  useApiMutation({
    mutationFn: createMatchupScore,
    size: "medium",
    pending: "updating the score...",
    success: "successfully updated score",
    invalidate: ["matchup"],
    afterSuccess: invalidateMatchups,
  });
