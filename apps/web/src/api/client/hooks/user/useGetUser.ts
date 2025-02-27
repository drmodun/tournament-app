"use server";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  IExtendedUserResponse,
  UserResponsesEnum,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const getUser = async (userId: number) =>
  clientApi
    .get<never, AxiosResponse<IExtendedUserResponse>>(`/users/${userId}`, {
      params: {
        id: userId,
        responseType: UserResponsesEnum.EXTENDED,
      },
    })
    .then((res) => res.data);

export const useGetUser = (userId: number) => {
  return useQuery({
    queryKey: ["userId", "me"],
    queryFn: () => getUser(userId),
    staleTime: Infinity,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
