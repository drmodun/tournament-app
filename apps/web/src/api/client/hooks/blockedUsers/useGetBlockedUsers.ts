"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IMiniUserResponseWithProfilePicture,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getBlockedUsers = async (page: number, groupId?: number) =>
  clientApi
    .get<
      never,
      AxiosResponse<IBaseQueryResponse<IMiniUserResponseWithProfilePicture>>
    >(`/blocked-users/${groupId}`, { params: { pageSize: 10, page } })
    .then((res) => res.data);

export const useGetBlockedUsers = (groupId?: number) => {
  return useInfiniteQuery({
    queryKey: ["blocked-users", groupId],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getBlockedUsers(pageParam, groupId),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (lastPage, pages) =>
      lastPage.results.length < 10 ? undefined : pages.length + 1,
    initialPageParam: 1,
  });
};
