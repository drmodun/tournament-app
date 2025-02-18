"use client";

import { useQuery } from "@tanstack/react-query";
import { IExtendedUserResponse } from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";

export const getAuthenticatedUser = async () =>
  clientApi
    .get<never, AxiosResponse<IExtendedUserResponse>>("/users/me")
    .then((res) => res.data);

export const useAuth = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getAuthenticatedUser,
    staleTime: Infinity,
    retryDelay: 10000,
    enabled: getAccessToken() !== null,
  });
};
