"use client";

import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  GroupResponsesEnum,
  IBaseQueryResponse,
  IExtendedRosterResponse,
  IExtendedUserResponse,
  IGroupResponseExtended,
  IMiniUserResponse,
  IMiniUserResponseWithProfilePicture,
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

export const searchUsers = async (page: number, search?: string) =>
  clientApi
    .get<never, AxiosResponse<IMiniUserResponseWithProfilePicture[]>>(
      `/users/auto-complete/${search}`,
      {
        params: {
          page: page,
          pageSize: 10,
        },
      },
    )
    .then((res) => res.data);

export const useSearchUsers = (search?: string) => {
  return useInfiniteQuery({
    queryKey: ["user", search ?? ""],
    queryFn: ({ pageParam }) => searchUsers(pageParam, search),
    staleTime: Infinity,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: (page, pages) =>
      (page?.length ?? -1) < 10 ? undefined : pages.length + 1, // todo: implementiraj kada bude fullCount implementiran
    initialPageParam: 1,
  });
};
