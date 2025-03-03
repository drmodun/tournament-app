"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IExtendedStageResponse,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  LARGE_QUERY_RETRY_ATTEMPTS,
  LARGE_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getTournamentStages = async (
  tournamentId?: number,
  pageParam?: number,
) => {
  return clientApi
    .get<never, AxiosResponse<IBaseQueryResponse<IExtendedStageResponse>>>(
      `/stages`,
      {
        params: {
          tournamentId,
          pageSize: 5,
          page: pageParam ?? 1,
        },
      },
    )
    .then((res) => res.data);
};

export const useGetTournamentStages = (tournamentId?: number) => {
  return useInfiniteQuery({
    queryKey: ["stage", "tournament", tournamentId ?? "", "tournaments"],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getTournamentStages(tournamentId, pageParam),
    staleTime: Infinity,
    retryDelay: LARGE_QUERY_RETRY_DELAY,
    retry: LARGE_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (lastPage, pages) =>
      lastPage.results.length < 5 ? undefined : pages.length + 1,
    initialPageParam: 1,
  });
};
