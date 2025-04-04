"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  IBaseQueryResponse,
  IExtendedRosterResponse,
  RosterResponsesEnum,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getParticipationRosters = async (
  page: number,
  participationId?: number,
) =>
  clientApi
    .get<never, AxiosResponse<IBaseQueryResponse<IExtendedRosterResponse>>>(
      `/roster/participation/${participationId}`,
      {
        params: {
          responseType: RosterResponsesEnum.EXTENDED,
          page: page,
          pageSize: 10,
        },
      },
    )
    .then((res) => res.data);

export const useGetParticipationRosters = (participationId?: number) => {
  return useInfiniteQuery({
    queryKey: ["roster", participationId ?? "", "participation"],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getParticipationRosters(pageParam, participationId),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.results.length < 10 ? undefined : allPages.length + 1,
    initialPageParam: 1,
  });
};
