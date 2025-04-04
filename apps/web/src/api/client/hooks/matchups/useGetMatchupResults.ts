"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IMatchupResponseWithResultsAndScores,
  IQueryRosterRequest,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getMatchupResults = async (page: number, matchupId?: number) =>
  clientApi
    .get<
      IQueryRosterRequest,
      AxiosResponse<IBaseQueryResponse<IMatchupResponseWithResultsAndScores>>
    >(`/matches/matchup/${matchupId}/results`, {
      params: {
        matchupId,
        page,
        pageSize: 10,
      },
    })
    .then((res) => res.data);

export const useGetMatchupResults = (matchupId?: number) => {
  return useInfiniteQuery({
    queryKey: ["matchup", matchupId ?? ""],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getMatchupResults(pageParam, matchupId),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.results.length < 10 ? undefined : allPages.length + 1,
    initialPageParam: 1,
  });
};
