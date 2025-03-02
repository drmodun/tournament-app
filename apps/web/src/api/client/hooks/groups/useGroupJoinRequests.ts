"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  GroupJoinRequestResponsesEnum,
  IBaseQueryResponse,
  IGroupJoinRequestQuery,
  IGroupJoinRequestWithMiniUserResponse,
  IGroupJoinRequestWithUserResponse,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  LARGE_QUERY_RETRY_ATTEMPTS,
  LARGE_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getGroupJoinRequests = async (
  groupId: number | undefined,
  page: number | undefined,
) =>
  clientApi
    .get<
      never,
      AxiosResponse<IBaseQueryResponse<IGroupJoinRequestWithMiniUserResponse>>
    >(`/group-join-requests`, {
      params: {
        responseType: GroupJoinRequestResponsesEnum.WITH_MINI_USER,
        groupId: groupId,
        page: page ?? 1,
        pageSize: 5,
      },
    })
    .then((res) => res.data);

export const useGroupJoinRequests = (groupId: number | undefined) => {
  return useInfiniteQuery({
    queryKey: ["group", "me", groupId],
    queryFn: ({ pageParam }: { pageParam?: number }) =>
      getGroupJoinRequests(groupId, pageParam),
    staleTime: Infinity,
    retryDelay: LARGE_QUERY_RETRY_DELAY,
    retry: LARGE_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (page, pages) => pages.length + 1, // TODO: promjeni kada je dodan fullCount
    initialPageParam: 1,
  });
};
