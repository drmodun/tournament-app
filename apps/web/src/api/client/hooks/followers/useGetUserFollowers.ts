"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  FollowerResponsesEnum,
  IBaseQueryResponse,
  IFollowerResponse,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { useAuth } from "../auth/useAuth";
import { AxiosResponse } from "axios";

export const getUserFollowers = async (
  userId: number | undefined,
  pageParam: number,
) =>
  clientApi
    .get<never, AxiosResponse<IBaseQueryResponse<IFollowerResponse>>>(
      `/followers`,
      {
        params: {
          userId: userId,
          responseType: FollowerResponsesEnum.FOLLOWER,
          pageSize: 10,
          page: pageParam ?? 1,
        },
      },
    )
    .then((res) => res.data);

export const useGetUserFollowers = () => {
  const { data } = useAuth();

  return useInfiniteQuery({
    queryKey: ["me", "follower"],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getUserFollowers(data?.id, pageParam),
    staleTime: Infinity,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
    getNextPageParam: () => undefined,
    initialPageParam: 1,
  });
};
