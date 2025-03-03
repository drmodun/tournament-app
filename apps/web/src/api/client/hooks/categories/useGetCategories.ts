"use client";

import { useQuery } from "@tanstack/react-query";
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

export const getCategories = async () =>
  clientApi
    .get<
      never,
      AxiosResponse<IBaseQueryResponse<ICategoryResponse>>
    >(`/categories`, { params: { responseType: CategoryResponsesEnum.EXTENDED } })
    .then((res) => res.data);

export const useGetCategories = () => {
  return useQuery({
    queryKey: ["category"],
    queryFn: getCategories,
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
