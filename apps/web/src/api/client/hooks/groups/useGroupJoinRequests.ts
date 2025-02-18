"use client";

import { useQuery } from "@tanstack/react-query";
import {
  IExtendedUserResponse,
  IGroupMembershipResponseWithDates,
} from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";

export const getGroupJoinRequests = async (groupId: number) =>
  clientApi
    .get<never, AxiosResponse<any>>(`/group-join-requests`, {
      params: {
        responseType: "with-mini-user",
        groupId: groupId,
      },
    })
    .then((res) => res.data);

export const useGroupJoinRequests = (groupId: number) => {
  return useQuery({
    queryKey: ["group", "me"],
    queryFn: () => getGroupJoinRequests(groupId),
    staleTime: Infinity,
    retryDelay: 10000,
    enabled: getAccessToken() !== null,
  });
};
