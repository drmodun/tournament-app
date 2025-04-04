"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  GroupMembershipResponsesEnum,
  IBaseQueryResponse,
  IGroupMembershipQueryRequest,
  IGroupMembershipResponse,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { useAuth } from "api/client/hooks/auth/useAuth";
import { AxiosResponse } from "axios";

export const getUserGroupsQuery = async (
  userId: number | undefined,
  page: number = 1,
  query?: IGroupMembershipQueryRequest,
) =>
  clientApi
    .get<
      IGroupMembershipQueryRequest,
      AxiosResponse<IBaseQueryResponse<IGroupMembershipResponse>>
    >(`/group-membership`, {
      params: {
        responseType: GroupMembershipResponsesEnum.BASE,
        userId: userId,
        pageSize: 2,
        page: page,
        ...query,
      },
    })
    .then((res) => {
      return res.data;
    });

export const useUserGroupsQuery = (query?: IGroupMembershipQueryRequest) => {
  const { data } = useAuth();

  return useInfiniteQuery({
    queryKey: ["group", "me", data?.id, query],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getUserGroupsQuery(data?.id, pageParam, query),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null && !!data?.id,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.results.length < 2 ? undefined : pages.length + 1;
    },
    initialPageParam: 1,
  });
};
