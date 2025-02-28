"use client";

import { useQuery } from "@tanstack/react-query";
import {
  groupRoleEnumType,
  IBaseQueryResponse,
  IExtendedTournamentResponse,
  IMiniGroupResponseWithCountry,
  TournamentResponseEnumType,
  TournamentResponsesEnum,
} from "@tournament-app/types";
import {
  baseApiUrl,
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useAuth } from "../auth/useAuth";

export const getUserOrganizedCompetitions = async (
  userId: number | undefined,
) =>
  clientApi
    .get<
      never,
      AxiosResponse<IBaseQueryResponse<IExtendedTournamentResponse>>
    >(`/tournaments`, { params: { creatorId: userId, responseType: TournamentResponsesEnum.EXTENDED } })
    .then((res) => res.data);

export const useGetUserOrganizedCompetitions = () => {
  const { data } = useAuth();
  return useQuery({
    queryKey: ["competition", "me"],
    queryFn: () => getUserOrganizedCompetitions(data?.id),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
