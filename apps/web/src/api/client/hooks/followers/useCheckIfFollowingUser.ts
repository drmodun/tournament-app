"use client";

import { useQuery } from "@tanstack/react-query";
import { IFollowerMiniResponse } from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { useAuth } from "../auth/useAuth";
import { AxiosResponse } from "axios";

export const checkIfFollowingUser = async (
  userId: number | undefined,
  followerId: number,
) =>
  clientApi
    .get<never, AxiosResponse<IFollowerMiniResponse>>(
      `/followers/${followerId}/${userId}`,
      {
        params: {
          userId: followerId,
          followerId: userId,
        },
      },
    )
    .then((res) => res.data);

export const useCheckIfFollowingUser = (followerId: number) => {
  const { data } = useAuth();

  return useQuery({
    queryKey: [followerId, "me", "follower"],
    queryFn: () => checkIfFollowingUser(data?.id, followerId),
    staleTime: Infinity,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
