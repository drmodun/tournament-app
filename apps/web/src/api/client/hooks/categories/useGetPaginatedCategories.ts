"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  CategoryResponsesEnum,
  IBaseQueryResponse,
  ICategoryResponse,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getPaginatedCategories = async (page?: number) =>
  clientApi
    .get<
      never,
      AxiosResponse<IBaseQueryResponse<ICategoryResponse>>
    >(`/categories`, { params: { responseType: CategoryResponsesEnum.EXTENDED, pageSize: 10, page: page } })
    .then((res) => res.data);

export const useGetPaginatedCategories = () => {
  return useInfiniteQuery({
    queryKey: ["category"],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getPaginatedCategories(pageParam),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.results.length < 10 ? undefined : allPages.length + 1,
  });
};
