"use client";

import { ICreateScoreRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { invalidateMatchups } from "./serverFetches";
import { useApiMutation } from "api/client/useApiMutation";

export const deleteMatchupScore = async ({
  id,
  tournamentId,
}: {
  id?: number;
  tournamentId?: number;
}) => {
  return clientApi
    .delete<ICreateScoreRequest, AxiosResponse>(
      `/matches/${tournamentId}/${id}/delete-score`,
      { params: { matchupId: id, tournamentId: tournamentId } },
    )
    .then((res) => res.data);
};

export const useDeleteMatchupScore = () =>
  useApiMutation({
    mutationFn: deleteMatchupScore,
    size: "medium",
    pending: "deleting the score...",
    success: "successfully deleted score",
    invalidate: ["matchup"],
    afterSuccess: invalidateMatchups,
  });
