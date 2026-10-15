"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IMatchupResponseWithResultsAndScores,
  IQueryRosterRequest,
} from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { pagedQueryOptions } from "api/client/queryOptions";
import { AxiosResponse } from "axios";

export const getMatchupResults = async (page: number, matchupId?: number) =>
  clientApi
    .get<
      IQueryRosterRequest,
      AxiosResponse<IBaseQueryResponse<IMatchupResponseWithResultsAndScores>>
    >(`/matches/matchup/${matchupId}/results`, {
      params: {
        matchupId,
        page,
        pageSize: 10,
      },
    })
    .then((res) => res.data);

export const useGetMatchupResults = (matchupId?: number) => {
  return useInfiniteQuery({
    queryKey: ["matchup", matchupId ?? ""],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getMatchupResults(pageParam, matchupId),
    ...pagedQueryOptions("medium"),
  });
};
