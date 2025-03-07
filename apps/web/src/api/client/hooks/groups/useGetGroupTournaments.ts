"use client";

import { useQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IMiniTournamentResponseWithLogo,
  TournamentResponsesEnum,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getGroupTournaments = async (groupId: number | undefined) =>
  clientApi
    .get<
      never,
      AxiosResponse<IBaseQueryResponse<IMiniTournamentResponseWithLogo>>
    >(`/tournaments`, { params: { affiliatedGroupId: groupId, responseType: TournamentResponsesEnum.MINI_WITH_LOGO } })
    .then((res) => res.data);

export const useGetGroupTournaments = (groupId: number | undefined) => {
  return useQuery({
    queryKey: ["group", groupId],
    queryFn: () => getGroupTournaments(groupId),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
