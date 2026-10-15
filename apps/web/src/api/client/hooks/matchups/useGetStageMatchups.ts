"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IMatchupsWithMiniRostersResponse,
  IQueryRosterRequest,
} from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { pagedArrayQueryOptions } from "api/client/queryOptions";
import { AxiosResponse } from "axios";

export const getStageMatchups = async (page: number, stageId?: number) => {
  return clientApi
    .get<
      IQueryRosterRequest,
      AxiosResponse<IMatchupsWithMiniRostersResponse[]>
    >(`/matches/managed`, {
      params: {
        page,
        pageSize: 10,
        stageId,
      },
    })
    .then((res) => {
      return res.data;
    });
};

export const useGetStageMatchups = (stageId?: number) => {
  return useInfiniteQuery({
    queryKey: ["matchup", "me", stageId],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getStageMatchups(pageParam, stageId),
    ...pagedArrayQueryOptions("medium"),
  });
};
