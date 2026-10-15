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

export const getUserRosters = async (page: number, userId?: number) =>
  clientApi
    .get<
      IQueryRosterRequest,
      AxiosResponse<IBaseQueryResponse<IRosterResponse>>
    >(`/roster/user/${userId}`, {
      params: {
        userId,
        page,
        pageSize: 10,
      },
    })
    .then((res) => res.data);

export const useGetUserRosters = (userId?: number) => {
  return useInfiniteQuery({
    queryKey: ["roster", userId ?? "", "me"],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getUserRosters(pageParam, userId),
    ...pagedQueryOptions("large"),
  });
};
