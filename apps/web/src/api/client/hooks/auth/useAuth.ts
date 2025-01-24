"use client";

import { useQuery } from "@tanstack/react-query";
import { IExtendedUserResponse } from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";

export const getAuthenticatedUser = async () =>
  clientApi.get<never, IExtendedUserResponse>("/users/me");

export const useAuth = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getAuthenticatedUser,
    staleTime: Infinity,
    retryDelay: 10000,
    enabled: getAccessToken() !== null,
  });
};
