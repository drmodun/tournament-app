import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IExtendedTournamentResponse,
  TournamentQueryType,
  TournamentResponsesEnum,
} from "@tournament-app/types";
import {
  baseApiUrl,
  clientApi,
  getAccessToken,
  LARGE_QUERY_RETRY_ATTEMPTS,
  LARGE_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getCompetitions = async (page?: number) =>
  clientApi
    .get<
      TournamentQueryType,
      AxiosResponse<IBaseQueryResponse<IExtendedTournamentResponse>>
    >(`/tournaments`, { params: { responseType: TournamentResponsesEnum.EXTENDED, page: page ?? 1, pageSize: 10 } })
    .then((res) => {
      return res.data;
    });

export const useGetCompetitions = () => {
  return useInfiniteQuery({
    queryKey: ["competition"],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getCompetitions(pageParam),
    staleTime: Infinity,
    retryDelay: LARGE_QUERY_RETRY_DELAY,
    retry: LARGE_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (page, pages) => pages.length + 1, // TODO: implementiraj kada bude fullCount implementiran
    initialPageParam: 1,
  });
};
