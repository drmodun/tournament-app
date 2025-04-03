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

export const getPaginatedUserInterests = async (page?: number) =>
  clientApi
    .get<
      never,
      AxiosResponse<IBaseQueryResponse<Interest>>
    >(`/interest`, { params: { pageSize: 10, page: page } })
    .then((res) => res.data);

export const useGetPaginatedUserInterests = () => {
  return useInfiniteQuery({
    queryKey: ["interest"],
    queryFn: ({ pageParam }: { pageParam?: number }) =>
      getPaginatedUserInterests(pageParam),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (page, pages) =>
      page.results.length < 10 ? undefined : pages.length + 1,
    initialPageParam: 1,
  });
};
