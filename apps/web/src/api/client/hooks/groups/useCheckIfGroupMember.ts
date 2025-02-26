"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BaseGroupMembershipResponseType,
  GroupJoinRequestResponsesEnum,
  GroupMembershipResponsesEnum,
  IFollowerMiniResponse,
  IGroupJoinRequestWithUserResponse,
} from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
import { useAuth } from "../auth/useAuth";
import { AxiosResponse } from "axios";

export const checkIfGroupMember = async (
  userId: number | undefined,
  groupId: number,
) =>
  clientApi
    .get<never, AxiosResponse<BaseGroupMembershipResponseType>>(
      `/group-membership/${groupId}/${userId}`,
      {
        params: {
          userId: userId,
          groupId: userId,
          responseType: GroupMembershipResponsesEnum.BASE,
        },
      },
    )
    .then((res) => res.data);

export const useCheckIfGroupMember = (groupId: number) => {
  const { data } = useAuth();

  return useQuery({
    queryKey: ["group", "me"],
    queryFn: () => checkIfGroupMember(data?.id, groupId),
    staleTime: Infinity,
    retryDelay: 500,
    retry: 3,
    enabled: getAccessToken() !== null,
  });
};
