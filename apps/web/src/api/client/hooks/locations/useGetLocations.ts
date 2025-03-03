"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IExtendedLocationResponse,
  ILocationResponse,
  LocationResponsesEnum,
} from "@tournament-app/types";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getLocations = async (pageParam?: number) =>
  clientApi
    .get<never, AxiosResponse<IBaseQueryResponse<IExtendedLocationResponse>>>(
      `/locations`,
      {
        params: {
          pageSize: 20,
          page: pageParam ?? 1,
          returnType: LocationResponsesEnum.EXTENDED,
        },
      },
    )
    .then((res) => res.data);

export const useGetLocations = () => {
  return useInfiniteQuery({
    queryKey: ["location"],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getLocations(pageParam),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    getNextPageParam: (page, pages) =>
      page.results.length < 20 ? undefined : pages.length + 1, // todo: implementiraj kada bude fullCount implementiran
    initialPageParam: 1,
  });
};
