"use client";

import { useQuery } from "@tanstack/react-query";
import { IQueryRosterRequest, IRosterResponse } from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getStageRostersManagedByUser = async (stageId?: number) =>
  clientApi
    .get<
      IQueryRosterRequest,
      AxiosResponse<IRosterResponse[]>
    >(`/roster/managed-by-user/${stageId}`)
    .then((res) => res.data);

export const useGetStageRostersManagedByUser = (stageId?: number) => {
  return useQuery({
    queryKey: ["roster", "me", stageId ?? ""],
    queryFn: () => getStageRostersManagedByUser(stageId),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
