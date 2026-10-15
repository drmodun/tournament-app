"use client";

import { IUpdateTournamentRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useApiMutation } from "api/client/useApiMutation";

export const createSoloParticipation = async (id: number) => {
  return clientApi
    .post<IUpdateTournamentRequest, AxiosResponse<{ id: number }>>(
      `/participations/apply-solo/${id}`,
      { params: { tournamentId: id } },
    )
    .then((res) => res.data);
};

export const useCreateSoloParticipation = () =>
  useApiMutation({
    mutationFn: createSoloParticipation,
    size: "medium",
    pending: "joining the competition...",
    success: "successfully joined competition",
    invalidate: ["participation"],
  });
