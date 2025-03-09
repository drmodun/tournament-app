"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IMiniGroupResponseWithLogo,
  IMiniTournamentResponseWithLogo,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const searchCompetitions = async (page: number, search?: string) =>
  clientApi
    .get<never, AxiosResponse<IMiniTournamentResponseWithLogo[]>>(
      `/tournaments/auto-complete/${search}`,
      {
        params: {
          page: page,
          pageSize: 10,
        },
      },
    )
    .then((res) => res.data);

export const useSearchCompetitions = (search?: string) => {
  return useInfiniteQuery({
    queryKey: ["competition", search ?? ""],
    queryFn: ({ pageParam }) => searchCompetitions(pageParam, search),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (page, pages) =>
      (page?.length ?? -1) < 10 ? undefined : pages.length + 1,
    initialPageParam: 1,
  });
};
