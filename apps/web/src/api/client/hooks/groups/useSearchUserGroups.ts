"use client";

import { useQuery } from "@tanstack/react-query";
import {
  GroupMembershipResponsesEnum,
  IGroupMembershipQueryRequest,
  IMiniGroupResponseWithLogo,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const searchUserGroups = async (search?: string) =>
  clientApi
    .get<
      IGroupMembershipQueryRequest,
      AxiosResponse<IMiniGroupResponseWithLogo[]>
    >(`/group-membership/auto-complete/groups/${search}`, {
      params: {
        responseType: GroupMembershipResponsesEnum.BASE,
        search: search,
      },
    })
    .then((res) => {
      return res.data;
    });

export const useSearchUserGroups = (search?: string) => {
  return useQuery({
    queryKey: ["group", "me", search],
    queryFn: () => searchUserGroups(search),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
