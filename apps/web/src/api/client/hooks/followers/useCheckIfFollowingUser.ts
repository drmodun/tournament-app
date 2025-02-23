"use client";

import { useQuery } from "@tanstack/react-query";
import { IFollowerMiniResponse } from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
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
    queryKey: ["group", "me"],
    queryFn: () => checkIfFollowingUser(data?.id, followerId),
    staleTime: Infinity,
    retryDelay: 500,
    retry: 3,
    enabled: getAccessToken() !== null,
  });
};
