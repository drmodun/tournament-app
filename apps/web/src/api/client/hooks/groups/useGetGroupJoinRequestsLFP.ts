"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IGroupJoinRequestQuery,
  IGroupJoinRequestWithMiniUserResponse,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getGroupJoinRequestsLFP = async (
  page: number | undefined,

  data?: IGroupJoinRequestQuery
) =>
  clientApi
    .get<
      IGroupJoinRequestQuery,
      AxiosResponse<IBaseQueryResponse<IGroupJoinRequestWithMiniUserResponse>>
    >(`/group-join-requests`, {
      params: {
        ...data,
        page: page ?? 1,
        pageSize: 10,
      },
    })
    .then((res) => res.data);

export const useGroupJoinRequestsLFP = (data?: IGroupJoinRequestQuery) => {
  return useInfiniteQuery({
    queryKey: ["group", data],
    queryFn: ({ pageParam }: { pageParam?: number }) =>
      getGroupJoinRequestsLFP(pageParam, data),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (page, pages) =>
      page.results.length < 10 ? undefined : pages.length + 1,
    initialPageParam: 1,
  });
};
