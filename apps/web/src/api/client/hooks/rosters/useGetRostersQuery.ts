"use client";

import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  GroupResponsesEnum,
  IBaseQueryResponse,
  IExtendedRosterResponse,
  IExtendedUserResponse,
  IGroupResponseExtended,
  IQueryRosterRequest,
  RosterResponsesEnum,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const getRostersQuery = async (
  page: number,
  query?: IQueryRosterRequest,
) =>
  clientApi
    .get<
      IQueryRosterRequest,
      AxiosResponse<IBaseQueryResponse<IExtendedRosterResponse>>
    >(`/roster`, {
      params: {
        responseType: RosterResponsesEnum.EXTENDED,
        page: page,
        pageSize: 15,
        ...query,
      },
    })
    .then((res) => res.data);

export const useGetRostersQuery = (query?: IQueryRosterRequest) => {
  return useInfiniteQuery({
    queryKey: ["roster", query ?? ""],
    queryFn: ({ pageParam }) => getRostersQuery(pageParam, query),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (page, pages) =>
      page.results.length < 15 ? undefined : pages.length + 1, // todo: implementiraj kada bude fullCount implementiran
    initialPageParam: 1,
  });
};
