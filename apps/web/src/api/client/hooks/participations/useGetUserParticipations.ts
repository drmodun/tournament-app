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
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useAuth } from "../auth/useAuth";

export const getUserParticipations = async (id?: number) =>
  clientApi
    .get<never, AxiosResponse<IBaseQueryResponse<IParticipationResponse>>>(
      `/participations`,
      {
        params: {
          responseType: ParticipationResponsesEnum.BASE,
          userId: id,
        },
      },
    )
    .then((res) => res.data);

export const useGetUserParticipations = () => {
  const { data } = useAuth();
  return useQuery({
    queryKey: ["participations", "competition", "me"],
    queryFn: () => getUserParticipations(data?.id),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
