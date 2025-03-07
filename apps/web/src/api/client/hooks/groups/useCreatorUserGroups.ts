"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  GroupMembershipResponsesEnum,
  groupRoleEnum,
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
import { AxiosResponse } from "axios";
import { useAuth } from "api/client/hooks/auth/useAuth";

export const getCreatorUserGroups = async (
  userId: number | undefined,
  page: number = 1,
) =>
  clientApi
    .get<
      IGroupMembershipQueryRequest,
      AxiosResponse<IBaseQueryResponse<IGroupMembershipResponse>>
    >(`/group-membership`, {
      params: {
        responseType: GroupMembershipResponsesEnum.BASE,
        userId: userId,
        pageSize: 10,
        page: page,
        returnFullCount: true,
        role: groupRoleEnum.OWNER,
      },
    })
    .then((res) => {
      return res.data;
    });

export const useCreatorUserGroups = () => {
  const { data } = useAuth();

  return useInfiniteQuery({
    queryKey: [data?.id?.toString() ?? "guest", "me"],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getCreatorUserGroups(data?.id, pageParam),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null && !!data?.id,
    getNextPageParam: (lastPage, pages) =>
      lastPage.results.length < 10 ? undefined : pages.length + 1,
    initialPageParam: 1,
  });
};
