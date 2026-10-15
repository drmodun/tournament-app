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

export const getGroupRosters = async (page: number, groupId?: number) =>
  clientApi
    .get<
      IQueryRosterRequest,
      AxiosResponse<IBaseQueryResponse<IRosterResponse>>
    >(`/roster/group/${groupId}`, {
      params: {
        groupId,
        page,
        pageSize: 10,
      },
    })
    .then((res) => res.data);

export const useGetGroupRosters = (groupId?: number) => {
  return useInfiniteQuery({
    queryKey: ["roster", groupId ?? "", "group"],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getGroupRosters(pageParam, groupId),
    ...pagedQueryOptions("large"),
  });
};
