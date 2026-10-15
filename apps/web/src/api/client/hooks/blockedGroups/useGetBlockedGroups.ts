"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IMiniGroupResponseWithCountry,
} from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { pagedQueryOptions } from "api/client/queryOptions";
import { AxiosResponse } from "axios";

export const getBlockedGroups = async (page: number) =>
  clientApi
    .get<
      never,
      AxiosResponse<IBaseQueryResponse<IMiniGroupResponseWithCountry>>
    >(`/blocked-groups`, { params: { pageSize: 10, page } })
    .then((res) => res.data);

export const useGetBlockedGroups = () => {
  return useInfiniteQuery({
    queryKey: ["blocked-groups", "me"],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getBlockedGroups(pageParam),
    ...pagedQueryOptions("medium"),
  });
};
