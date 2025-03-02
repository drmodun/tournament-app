"use client";

import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  groupRoleEnumType,
  ICreateGroupRequest,
  IMiniGroupResponseWithCountry,
  IMiniUserResponseWithCountry,
  userRoleEnumType,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useEffect } from "react";
import { useToastContext } from "utils/hooks/useToastContext";

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

export const getGroupMembers = async (page?: number, groupId?: number) =>
  clientApi
    .get<
      never,
      AxiosResponse<GroupMembersType>
    >(`/groups/${groupId}/members`, { params: { groupId } })
    .then((res) => res.data);

export const useGetGroupMembers = (groupId: number | undefined) => {
  return useInfiniteQuery({
    queryKey: ["group", groupId],
    queryFn: ({ pageParam }: { pageParam?: number }) =>
      getGroupMembers(pageParam, groupId),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (lastPage, allPages) => allPages.length + 1,
    initialPageParam: 1,
  });
};
