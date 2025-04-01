"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CategoryResponsesEnum,
  IMiniGroupResponseWithCountry,
  IMiniUserResponseWithProfilePicture,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const searchBlockedGroups = async (val?: string) =>
  clientApi
    .get<
      never,
      AxiosResponse<IMiniGroupResponseWithCountry[]>
    >(`/blocked-groups/auto-complete/${val}`)
    .then((res) => res.data);

export const useSearchBlockedGroups = () => {
  return useQuery({
    queryKey: ["blocked-groups"],
    queryFn: ({ queryKey }: { queryKey: [string, string?] }) => {
      const [, val] = queryKey;
      return searchBlockedGroups(val);
    },
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
