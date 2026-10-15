"use client";

import { ICreateRosterRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { invalidateRosters } from "./serverFetches";
import { useApiMutation } from "api/client/useApiMutation";

export const createRoster = async (data: {
  participationId?: number;
  stageId?: number;
  members?: { userId?: number; isSubstitute?: boolean }[];
}) => {
  return clientApi
    .post<ICreateRosterRequest, AxiosResponse<{ id: number }>>(
      `/roster/${data.participationId}/${data.stageId}`,
      { members: data.members },
    )
    .then((res) => res.data);
};

export const useCreateRoster = () =>
  useApiMutation({
    mutationFn: createRoster,
    size: "medium",
    pending: "creating the roster...",
    success: "successfully created roster",
    invalidate: ["roster"],
    afterSuccess: invalidateRosters,
  });
