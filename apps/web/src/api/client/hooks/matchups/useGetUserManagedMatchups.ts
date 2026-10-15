"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IMatchupsWithMiniRostersResponse,
  IQueryRosterRequest,
} from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { pagedArrayQueryOptions } from "api/client/queryOptions";
import { AxiosResponse } from "axios";

export const getUserManagedMatchups = async (page: number) => {
  console.log(page);
  return clientApi
    .get<
      IQueryRosterRequest,
      AxiosResponse<IMatchupsWithMiniRostersResponse[]>
    >(`/matches/managed`, {
      params: {
        page,
        pageSize: 10,
      },
    })
    .then((res) => {
      return res.data;
    });
};

export const useGetUserManagedMatchups = () => {
  return useInfiniteQuery({
    queryKey: ["matchup", "me"],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getUserManagedMatchups(pageParam),
    ...pagedArrayQueryOptions("medium"),
  });
};
