"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IQueryRosterRequest,
  IRosterResponse,
} from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { pagedQueryOptions } from "api/client/queryOptions";
import { AxiosResponse } from "axios";

export const getStageRosters = async (page: number, stageId?: number) =>
  clientApi
    .get<
      IQueryRosterRequest,
      AxiosResponse<IBaseQueryResponse<IRosterResponse>>
    >(`/roster/stage/${stageId}`, {
      params: {
        stageId,
        page,
        pageSize: 10,
      },
    })
    .then((res) => res.data);

export const useGetStageRosters = (stageId?: number) => {
  return useInfiniteQuery({
    queryKey: ["roster", stageId ?? ""],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getStageRosters(pageParam, stageId),
    ...pagedQueryOptions("large"),
  });
};
