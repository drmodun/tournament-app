"use client";

import { useQuery } from "@tanstack/react-query";
import {
  IExtendedRosterResponse,
  RosterResponsesEnum,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getRoster = async (rosterId: number) =>
  clientApi
    .get<never, AxiosResponse<IExtendedRosterResponse>>(`/roster/${rosterId}`, {
      params: {
        responseType: RosterResponsesEnum.EXTENDED,
      },
    })
    .then((res) => res.data);

export const useGetRoster = (rosterId: number) => {
  return useQuery({
    queryKey: ["roster", rosterId ?? ""],
    queryFn: () => getRoster(rosterId),
    staleTime: Infinity,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
