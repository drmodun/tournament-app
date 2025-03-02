"use client";

import { useQuery } from "@tanstack/react-query";
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
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useAuth } from "../auth/useAuth";

export const getCategory = async (id: number) =>
  clientApi
    .get<
      never,
      AxiosResponse<ICategoryResponse>
    >(`/categories/${id}`, { params: { responseType: CategoryResponsesEnum.EXTENDED, id } })
    .then((res) => res.data);

export const useGetCategory = (id: number) => {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(id),
    staleTime: Infinity,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
