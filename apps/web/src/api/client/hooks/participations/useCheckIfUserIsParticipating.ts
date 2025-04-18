"use client";

import { useQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IParticipationResponse,
  ParticipationResponsesEnum,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const checkIfUserIsParticipating = async (data: {
  tournamentId?: number;
  userId?: number;
}) =>
  clientApi
    .get<never, AxiosResponse<IBaseQueryResponse<IParticipationResponse>>>(
      `/participations`,
      {
        params: {
          responseType: ParticipationResponsesEnum.BASE,
          ...data,
        },
      },
    )
    .then((res) => res.data);

export const useCheckIfUserIsParticipating = (
  tournamentId?: number,
  userId?: number,
) => {
  return useQuery({
    queryKey: ["participation", "competition", "me", tournamentId, userId],
    queryFn: () => checkIfUserIsParticipating({ tournamentId, userId }),
    staleTime: Infinity,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
