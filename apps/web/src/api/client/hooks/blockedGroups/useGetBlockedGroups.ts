"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IMiniGroupResponseWithCountry,
  IMiniUserResponseWithProfilePicture,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getBlockedGroups = async (page: number) =>
  clientApi
    .get<
      never,
      AxiosResponse<IBaseQueryResponse<IMiniGroupResponseWithCountry>>
    >(`/blocked-groups`, { params: { pageSize: 10, page } })
    .then((res) => res.data);

export const useGetBlockedGroups = () => {
  return useInfiniteQuery({
    queryKey: ["blocked-groups", "me"],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getBlockedGroups(pageParam),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (lastPage, pages) =>
      lastPage.results.length < 10 ? undefined : pages.length + 1,
    initialPageParam: 1,
  });
};
