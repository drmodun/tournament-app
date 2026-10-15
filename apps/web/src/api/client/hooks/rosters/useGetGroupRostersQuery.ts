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

export const getGroupRostersQuery = async (
  page: number,
  query?: IQueryRosterRequest,
) =>
  clientApi
    .get<
      IQueryRosterRequest,
      AxiosResponse<IBaseQueryResponse<IRosterResponse>>
    >(`/roster/group/${query?.groupId}`, {
      params: {
        ...query,
        page,
        pageSize: 10,
      },
    })
    .then((res) => res.data);

export const useGetGroupRostersQuery = (query?: IQueryRosterRequest) => {
  return useInfiniteQuery({
    queryKey: ["roster", query ?? "", "group"],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getGroupRostersQuery(pageParam, query),
    ...pagedQueryOptions("large"),
  });
};
