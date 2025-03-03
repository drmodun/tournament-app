"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  GroupInviteResponsesEnum,
  IBaseQueryResponse,
  IGroupInviteQuery,
  IGroupInviteWithGroupResponse,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { useAuth } from "../auth/useAuth";
import { AxiosResponse } from "axios";

export const getUserGroupInvites = async (
  userId: number | undefined,
  pageParam: number,
) => {
  return clientApi
    .get<
      IGroupInviteQuery,
      AxiosResponse<IBaseQueryResponse<IGroupInviteWithGroupResponse>>
    >(`/group-invites`, {
      params: {
        userId: userId,
        responseType: GroupInviteResponsesEnum.WITH_GROUP,
        pageSize: 5,
        page: pageParam ?? 1,
      },
    })
    .then((res) => res.data);
};

export const useGetUserGroupInvites = () => {
  const { data } = useAuth();

  return useInfiniteQuery({
    queryKey: ["me", "groupInvite", "group", data?.id ?? ""],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getUserGroupInvites(data?.id, pageParam),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (lastPage, pages) =>
      lastPage.results.length < 5 ? undefined : pages.length + 1,
    initialPageParam: 1,
  });
};
