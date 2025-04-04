"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { IBaseQueryResponse } from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export type Interest = {
  id: number;
  name: string;
  image: string;
  type: string;
  description: string;
};

export const getGroupInterests = async (groupId?: number, page?: number) => {
  console.log(groupId, page, "aaaa");
  return clientApi
    .get<
      never,
      AxiosResponse<IBaseQueryResponse<Interest>>
    >(`/group-interests/${groupId}`, { params: { pageSize: 10, page: page } })
    .then((res) => res.data);
};

export const useGetGroupInterests = (groupId?: number) => {
  return useInfiniteQuery({
    queryKey: ["interest", groupId],
    queryFn: ({ pageParam }: { pageParam?: number }) =>
      getGroupInterests(groupId, pageParam),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (page, pages) =>
      page.results.length < 10 ? undefined : pages.length + 1,
    initialPageParam: 1,
  });
};
