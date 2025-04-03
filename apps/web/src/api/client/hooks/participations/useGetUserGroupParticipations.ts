"use client";

import { useQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IMiniParticipationResponseWithGroup,
  IParticipationResponse,
  ParticipationResponsesEnum,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getUserGroupParticipations = async (tournamentId?: number) =>
  clientApi
    .get<never, AxiosResponse<IMiniParticipationResponseWithGroup[]>>(
      `/participations/managed-for-player/${tournamentId}`,
      {
        params: {
          responseType: ParticipationResponsesEnum.BASE,
        },
      },
    )
    .then((res) => res.data);

export const useGetUserGroupParticipations = (tournamentId?: number) => {
  return useQuery({
    queryKey: ["competition", "me", tournamentId],
    queryFn: () => getUserGroupParticipations(tournamentId),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
