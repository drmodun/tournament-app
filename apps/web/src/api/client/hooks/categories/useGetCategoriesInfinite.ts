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

export const getCategoriesInfinite = async (page: number) =>
  clientApi
    .get<
      never,
      AxiosResponse<IBaseQueryResponse<ICategoryResponse>>
    >(`/categories`, { params: { responseType: CategoryResponsesEnum.EXTENDED, pageSize: 20, page } })
    .then((res) => res.data);

export const useGetCategoriesInfinite = () => {
  return useInfiniteQuery({
    queryKey: ["category", "categoryInfinite"],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getCategoriesInfinite(pageParam),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (lastPage, pages) => pages.length + 1,
    initialPageParam: 1,
  });
};
