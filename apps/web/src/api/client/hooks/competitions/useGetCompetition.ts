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
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
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
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
  });
};
