"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  GroupResponsesEnum,
  groupRoleEnumType,
  IBaseQueryResponse,
  IMiniGroupResponseWithCountry,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

type GroupMembersType = {
  group: IMiniGroupResponseWithCountry;
  members: {
    id: number;
    username: string;
    profilePicture: string;
    country: string;
    createdAt: string;
    role: groupRoleEnumType;
  }[];
};

export const getGroupMembersQuery = async (
  groupId: number | undefined,
  page: number | undefined,
) =>
  clientApi
    .get<never, AxiosResponse<IBaseQueryResponse<GroupMembersType>>>(
      `/groups/${groupId}/members`,
      {
        params: {
          responseType: GroupResponsesEnum.BASE,
          groupId: groupId,
          page: page ?? 1,
          pageSize: 15,
        },
      },
    )
    .then((res) => res.data);

export const useGetGroupMembersQuery = (groupId: number | undefined) => {
  return useInfiniteQuery({
    queryKey: ["group", groupId],
    queryFn: ({ pageParam }: { pageParam?: number }) =>
      getGroupMembersQuery(groupId, pageParam),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (page, pages) =>
      page.results.length < 15 ? undefined : pages.length + 1,
    initialPageParam: 1,
  });
};
