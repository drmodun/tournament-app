"use server";

import { useQuery } from "@tanstack/react-query";
import {
  groupRoleEnumType,
  IBaseQueryResponse,
  IExtendedTournamentResponse,
  IMiniGroupResponseWithCountry,
  TournamentResponseEnumType,
  TournamentResponsesEnum,
} from "@tournament-app/types";
import { baseApiUrl, clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";
import { useAuth } from "../auth/useAuth";

export const getCompetition = async (competitionId: number | undefined) =>
  clientApi
    .get<
      never,
      AxiosResponse<IBaseQueryResponse<IExtendedTournamentResponse>>
    >(`/tournaments/${competitionId}`, { params: { id: competitionId, responseType: TournamentResponsesEnum.EXTENDED } })
    .then((res) => res.data);

export const useGetCompetition = (competitionId: number) => {
  return useQuery({
    queryKey: ["competition"],
    queryFn: () => getCompetition(competitionId),
    staleTime: Infinity,
    retryDelay: 10000,
  });
};
