"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BaseGroupMembershipResponseType,
  GroupJoinRequestResponsesEnum,
  GroupMembershipResponsesEnum,
  IFollowerMiniResponse,
  IGroupJoinRequestWithUserResponse,
  IGroupMembershipQueryRequest,
  IGroupMembershipResponse,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { useAuth } from "../auth/useAuth";
import { AxiosResponse } from "axios";

export const checkIfGroupMember = async (
  userId?: number | undefined,
  groupId?: number,
) =>
  clientApi
    .get<IGroupMembershipQueryRequest, AxiosResponse<IGroupMembershipResponse>>(
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

export const useCheckIfGroupMember = (groupId?: number) => {
  const { data } = useAuth();

  return useQuery({
    queryKey: ["group", "me"],
    queryFn: () => checkIfGroupMember(data?.id, groupId),
    staleTime: Infinity,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
