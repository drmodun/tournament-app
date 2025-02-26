"use server";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  IExtendedUserResponse,
  UserResponsesEnum,
} from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
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
    retryDelay: 10000,
    enabled: getAccessToken() !== null,
  });
};
