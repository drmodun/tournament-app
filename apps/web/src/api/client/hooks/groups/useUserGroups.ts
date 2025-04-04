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

export const getUserGroups = async (
  userId: number | undefined,
  page: number = 1,
  pageSize?: number,
) =>
  clientApi
    .get<
      IGroupMembershipQueryRequest,
      AxiosResponse<IBaseQueryResponse<IGroupMembershipResponse>>
    >(`/group-membership`, {
      params: {
        responseType: GroupMembershipResponsesEnum.BASE,
        userId: userId,
        pageSize: pageSize ?? 2,
        page: page,
      },
    })
    .then((res) => {
      return res.data;
    });

export const getUserGroupsMini = async (
  userId: number | undefined,
  page: number = 1,
  pageSize?: number,
) =>
  clientApi
    .get<
      IGroupMembershipQueryRequest,
      AxiosResponse<IBaseQueryResponse<IGroupMembershipResponse>>
    >(`/group-membership`, {
      params: {
        responseType: GroupMembershipResponsesEnum.USER_MINI_WITH_COUNTRY,
        userId: userId,
        pageSize: pageSize ?? 2,
        page: page,
        returnFullCount: true,
      },
    })
    .then((res) => {
      return res.data;
    });

export const useUserGroups = (mini: boolean = false, pageSize: number = 2) => {
  const { data } = useAuth();

  return useInfiniteQuery({
    queryKey: ["group", "me", data?.id, mini, pageSize],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      mini
        ? getUserGroupsMini(data?.id, pageParam, pageSize)
        : getUserGroups(data?.id, pageParam, pageSize),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null && !!data?.id,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.results.length < (pageSize ?? 2)
        ? undefined
        : pages.length + 1;
    },
    initialPageParam: 1,
  });
};
