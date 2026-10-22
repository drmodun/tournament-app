"use client";

import { useQuery } from "@tanstack/react-query";
import { IApiTokenResponse } from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
import { retryOptions } from "api/client/queryOptions";
import { AxiosResponse } from "axios";

export const getApiTokens = async () =>
  clientApi
    .get<never, AxiosResponse<IApiTokenResponse[]>>("/auth/tokens")
    .then((res) => res.data);

export const useGetApiTokens = () =>
  useQuery({
    queryKey: ["api-tokens"],
    queryFn: getApiTokens,
    staleTime: Infinity,
    ...retryOptions("small"),
    enabled: getAccessToken() !== null,
  });
