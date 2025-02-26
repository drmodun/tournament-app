"use client";

import {
  InfiniteData,
  QueryFunction,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import {
  GroupMembershipResponsesEnum,
  GroupMembershipReturnTypesEnumType,
  IBaseQueryResponse,
  IExtendedUserResponse,
  IGroupMembershipQueryRequest,
  IGroupMembershipResponse,
  IGroupMembershipResponseWithDates,
} from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { useAuth } from "api/client/hooks/auth/useAuth";

export const getUserGroups = async (
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
        pageSize: 2,
        page: page,
        returnFullCount: true,
      },
    })
    .then((res) => {
      return res.data;
    });

export const getUserGroupsMini = async (
  userId: number | undefined,
  page: number = 1,
) =>
  clientApi
    .get<
      IGroupMembershipQueryRequest,
      AxiosResponse<IBaseQueryResponse<IGroupMembershipResponse>>
    >(`/group-membership`, {
      params: {
        responseType: GroupMembershipResponsesEnum.USER_MINI_WITH_COUNTRY,
        userId: userId,
        pageSize: 2,
        page: page,
        returnFullCount: true,
      },
    })
    .then((res) => {
      return res.data;
    });

export const useUserGroups = (mini: boolean = false) => {
  const { data } = useAuth();

  return useInfiniteQuery({
    queryKey: ["group", "me", data?.id?.toString() ?? "guest", mini],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      mini
        ? getUserGroupsMini(data?.id, pageParam)
        : getUserGroups(data?.id, pageParam),
    staleTime: Infinity,
    retryDelay: 10000,
    enabled: getAccessToken() !== null && !!data?.id,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.results.length < 2
        ? undefined
        : lastPage.metadata.pagination.page + 1;
    },
    initialPageParam: 1,
  });
};
