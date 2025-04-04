"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
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

export const getUserManagedMatchups = async (page: number) => {
  console.log(page);
  return clientApi
    .get<
      IQueryRosterRequest,
      AxiosResponse<IMatchupResponseWithResultsAndScores[]>
    >(`/matches/managed`, {
      params: {
        page,
        pageSize: 10,
      },
    })
    .then((res) => {
      console.log(res.data);
      return res.data;
    });
};

export const useGetUserManagedMatchups = () => {
  return useInfiniteQuery({
    queryKey: ["matchup", "me"],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getUserManagedMatchups(pageParam),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (lastPage, allPages) => allPages.length + 1,
    initialPageParam: 1,
  });
};
