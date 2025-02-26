"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  FollowerResponsesEnum,
  GroupJoinRequestResponsesEnum,
  IBaseQueryResponse,
  IFollowerMiniResponse,
  IFollowerResponse,
  IGroupJoinRequestWithUserResponse,
} from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
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
    queryKey: ["group", "me"],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getUserFollowers(data?.id, pageParam),
    staleTime: Infinity,
    retryDelay: 1000,
    retry: 5,
    enabled: getAccessToken() !== null,
    getNextPageParam: () => undefined,
    initialPageParam: 1,
  });
};
