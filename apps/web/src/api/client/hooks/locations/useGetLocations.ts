"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  FollowerResponsesEnum,
  GroupJoinRequestResponsesEnum,
  IBaseQueryResponse,
  IFollowerMiniResponse,
  IFollowerResponse,
  IGroupJoinRequestWithUserResponse,
  ILocationResponse,
  LocationResponsesEnum,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { useAuth } from "../auth/useAuth";
import { AxiosResponse } from "axios";

export const getLocations = async (pageParam?: number) =>
  clientApi
    .get<never, AxiosResponse<IBaseQueryResponse<ILocationResponse>>>(
      `/locations`,
      {
        params: {
          pageSize: 20,
          page: pageParam ?? 1,
        },
      },
    )
    .then((res) => res.data);

export const useGetLocations = () => {
  return useInfiniteQuery({
    queryKey: ["location"],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getLocations(pageParam),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    getNextPageParam: (page, pages) => pages.length + 1, // todo: implementiraj kada bude fullCount implementiran
    initialPageParam: 1,
  });
};
