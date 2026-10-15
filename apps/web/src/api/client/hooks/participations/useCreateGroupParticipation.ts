"use client";

import { IUpdateTournamentRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useApiMutation } from "api/client/useApiMutation";

export const createGroupParticipation = async (data: {
  id: number;
  groupId: number;
  userId: number;
}) => {
  return clientApi
    .post<IUpdateTournamentRequest, AxiosResponse<{ id: number }>>(
      `/participations/apply-group/${data.id}/${data.groupId}`,
      { params: { tournamentId: data.id, groupId: data.groupId } },
    )
    .then((res) => res.data);
};

export const useCreateGroupParticipation = () =>
  useApiMutation({
    mutationFn: createGroupParticipation,
    size: "medium",
    pending: "joining the competition...",
    success: "successfully joined competition",
    invalidate: ["participation"],
  });
