"use client";

import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  GroupResponsesEnum,
  IBaseQueryResponse,
  IExtendedUserResponse,
  IGetLFPRequest,
  IGroupResponseExtended,
  ILFPResponse,
  IQueryRosterRequest,
  IRosterResponse,
  IStageResponse,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  LARGE_QUERY_RETRY_ATTEMPTS,
  LARGE_QUERY_RETRY_DELAY,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const getGroupRosters = async (page: number, groupId?: number) =>
  clientApi
    .get<
      IQueryRosterRequest,
      AxiosResponse<IBaseQueryResponse<IRosterResponse>>
    >(`/roster/group/${groupId}`, {
      params: {
        groupId,
        page,
        pageSize: 10,
      },
    })
    .then((res) => res.data);

export const useGetGroupRosters = (groupId?: number) => {
  return useInfiniteQuery({
    queryKey: ["roster", groupId ?? "", "group"],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getGroupRosters(pageParam, groupId),
    staleTime: Infinity,
    retryDelay: LARGE_QUERY_RETRY_DELAY,
    retry: LARGE_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.results.length < 10 ? undefined : allPages.length + 1,
    initialPageParam: 1,
  });
};
