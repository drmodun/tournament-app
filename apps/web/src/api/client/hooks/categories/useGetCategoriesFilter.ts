"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  CategoryResponsesEnum,
  IBaseQueryResponse,
  ICategoryResponse,
} from "@tournament-app/types";
import {
  baseApiUrl,
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useAuth } from "../auth/useAuth";

export const getCategoriesFilter = async (pageParam: number, name?: string) =>
  clientApi
    .get<
      never,
      AxiosResponse<IBaseQueryResponse<ICategoryResponse>>
    >(`/categories`, { params: { responseType: CategoryResponsesEnum.EXTENDED, page: pageParam, pageSize: 20, name } })
    .then((res) => res.data);

export const useGetCategoriesFilter = (name?: string) => {
  return useInfiniteQuery({
    queryKey: [name, "category"],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getCategoriesFilter(pageParam, name),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (lastPage, pages) =>
      lastPage.metadata.pagination.page + 1,
    initialPageParam: 1,
  });
};
