"use client";

import { useQuery } from "@tanstack/react-query";
import {
  IExtendedRosterResponse,
  RosterResponsesEnum,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getParticipationRosters = async (participationId?: number) =>
  clientApi
    .get<never, AxiosResponse<IExtendedRosterResponse>>(
      `/roster/participation/${participationId}`,
      {
        params: {
          responseType: RosterResponsesEnum.EXTENDED,
        },
      },
    )
    .then((res) => res.data);

export const useGetParticipationRosters = (participationId?: number) => {
  return useQuery({
    queryKey: ["roster", participationId ?? "", "participation"],
    queryFn: () => getParticipationRosters(participationId),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
