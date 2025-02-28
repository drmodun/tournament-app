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
  groupRoleEnum,
  IBaseQueryResponse,
  IExtendedUserResponse,
  IGroupMembershipQueryRequest,
  IGroupMembershipResponse,
  IGroupMembershipResponseWithDates,
  userRoleEnum,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { useAuth } from "api/client/hooks/auth/useAuth";

export const getAdminUserGroups = async (
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
        role: groupRoleEnum.ADMIN,
      },
    })
    .then((res) => {
      return res.data;
    });

export const useAdminUserGroups = () => {
  const { data } = useAuth();

  return useInfiniteQuery({
    queryKey: ["group", "me", data?.id?.toString() ?? "guest"],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getAdminUserGroups(data?.id, pageParam),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null && !!data?.id,
    getNextPageParam: (lastPage, pages) =>
      lastPage.metadata.pagination.page + 1,
    initialPageParam: 1,
  });
};
