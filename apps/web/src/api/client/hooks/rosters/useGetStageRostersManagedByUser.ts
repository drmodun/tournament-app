"use client";

import { useQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IQueryRosterRequest,
  IRosterResponse,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  LARGE_QUERY_RETRY_ATTEMPTS,
  LARGE_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getStageRostersManagedByUser = async (stageId?: number) =>
  clientApi
    .get<IQueryRosterRequest, AxiosResponse<IRosterResponse[]>>(
      `/roster/managed-by-user/${stageId}`,
      {
        params: {
          stageId,
        },
      },
    )
    .then((res) => res.data);

export const useGetStageRostersManagedByUser = (stageId?: number) => {
  return useQuery({
    queryKey: ["roster", "me", stageId ?? ""],
    queryFn: () => getStageRostersManagedByUser(stageId),
    staleTime: Infinity,
    retryDelay: LARGE_QUERY_RETRY_DELAY,
    retry: LARGE_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
