import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IExtendedTournamentResponse,
  TournamentQueryType,
  TournamentResponsesEnum,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  LARGE_QUERY_RETRY_ATTEMPTS,
  LARGE_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getCompetitionsQuery = async (
  page?: number,
  locationId?: number,
) => {
  if (!locationId) return;
  console.log("LOCATION ID", locationId);
  return clientApi
    .get<
      TournamentQueryType,
      AxiosResponse<IBaseQueryResponse<IExtendedTournamentResponse>>
    >(`/tournaments`, { params: { responseType: TournamentResponsesEnum.EXTENDED, page: page ?? 1, pageSize: 10, locationId } })
    .then((res) => {
      return res.data;
    });
};

export const useGetCompetitionsQuery = (locationId?: number) => {
  return useInfiniteQuery({
    queryKey: ["competition", locationId ?? "", "place"],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getCompetitionsQuery(pageParam, locationId),
    staleTime: Infinity,
    retryDelay: LARGE_QUERY_RETRY_DELAY,
    retry: LARGE_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (page, pages) =>
      (page?.results?.length ?? -1) < 10 ? undefined : pages.length + 1,
    initialPageParam: 1,
  });
};
