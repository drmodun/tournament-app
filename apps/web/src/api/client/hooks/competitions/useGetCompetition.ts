import { useQuery } from "@tanstack/react-query";
import {
  IExtendedTournamentResponse,
  TournamentResponsesEnum,
} from "@tournament-app/types";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getCompetition = async (competitionId: number | undefined) =>
  clientApi
    .get<
      never,
      AxiosResponse<IExtendedTournamentResponse>
    >(`/tournaments/${competitionId}`, { params: { id: competitionId, responseType: TournamentResponsesEnum.EXTENDED } })
    .then((res) => res.data);

export const useGetCompetition = (competitionId: number) => {
  return useQuery({
    queryKey: [competitionId, "competition"],
    queryFn: () => getCompetition(competitionId),
    staleTime: Infinity,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
  });
};
