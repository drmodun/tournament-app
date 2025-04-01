"use client";

import { useQuery } from "@tanstack/react-query";
import { IMiniUserResponseWithProfilePicture } from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const searchBlockedUsers = async (groupId?: string, val?: string) =>
  clientApi
    .get<
      never,
      AxiosResponse<IMiniUserResponseWithProfilePicture[]>
    >(`/blocked-users/auto-complete/${groupId}/${val}`)
    .then((res) => res.data);

export const useSearchBlockedUsers = (groupId?: string) => {
  return useQuery({
    queryKey: ["blocked-users"],
    queryFn: ({ queryKey }: { queryKey: [string, string?] }) => {
      const [, val] = queryKey;
      return searchBlockedUsers(groupId, val);
    },
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
