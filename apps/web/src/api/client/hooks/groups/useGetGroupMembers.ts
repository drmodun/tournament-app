"use client";

import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  groupRoleEnumType,
  ICreateGroupRequest,
  IMiniGroupResponseWithCountry,
  IMiniUserResponseWithCountry,
  userRoleEnumType,
} from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
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

export const getGroupMembers = async (groupId: number | undefined) =>
  clientApi
    .get<
      never,
      AxiosResponse<GroupMembersType>
    >(`/groups/${groupId}/members`, { params: { groupId } })
    .then((res) => res.data);

export const useGetGroupMembers = (groupId: number | undefined) => {
  return useQuery({
    queryKey: ["group", "me"],
    queryFn: () => getGroupMembers(groupId),
    staleTime: Infinity,
    retryDelay: 10000,
    enabled: getAccessToken() !== null,
  });
};
