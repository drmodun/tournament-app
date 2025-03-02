"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  GroupResponsesEnum,
  IExtendedRosterResponse,
  IExtendedUserResponse,
  IGroupResponseExtended,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const getRoster = async (rosterId: number) =>
  clientApi
    .get<never, AxiosResponse<IExtendedRosterResponse>>(`/roster/${rosterId}`, {
      params: {
        responseType: GroupResponsesEnum.EXTENDED,
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
