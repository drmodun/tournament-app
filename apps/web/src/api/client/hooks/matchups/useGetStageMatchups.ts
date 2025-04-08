"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IMatchupsWithMiniRostersResponse,
  IQueryRosterRequest,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getStageMatchups = async (page: number, stageId?: number) => {
  return clientApi
    .get<
      IQueryRosterRequest,
      AxiosResponse<IMatchupsWithMiniRostersResponse[]>
    >(`/matches/managed`, {
      params: {
        page,
        pageSize: 10,
        stageId,
      },
    })
    .then((res) => {
      return res.data;
    });
};

export const useGetStageMatchups = (stageId?: number) => {
  return useInfiniteQuery({
    queryKey: ["matchup", "me", stageId],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getStageMatchups(pageParam, stageId),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (lastPage, allPages) =>
      allPages[allPages.length - 1].length < 10
        ? undefined
        : allPages.length + 1,
    initialPageParam: 1,
  });
};
