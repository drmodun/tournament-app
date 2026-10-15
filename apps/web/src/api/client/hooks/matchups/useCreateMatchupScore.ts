"use client";

import { ICreateScoreRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { invalidateMatchups } from "./serverFetches";
import { useApiMutation } from "api/client/useApiMutation";

export const updateMatchupScore = async ({
  id,
  tournamentId,
  data,
}: {
  id?: number;
  tournamentId?: number;
  data?: ICreateScoreRequest;
}) => {
  return clientApi
    .patch<ICreateScoreRequest, AxiosResponse>(
      `/matches/${tournamentId}/${id}/score`,
      { params: { matchupId: id, tournamentId: tournamentId }, data: data },
    )
    .then((res) => res.data);
};

export const useUpdateMatchupScore = () =>
  useApiMutation({
    mutationFn: updateMatchupScore,
    size: "medium",
    pending: "creating the score...",
    success: "successfully created score",
    invalidate: ["matchup"],
    afterSuccess: invalidateMatchups,
  });
