"use client";

import { useQuery } from "@tanstack/react-query";
import { ILFPResponse } from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  LARGE_QUERY_RETRY_ATTEMPTS,
  LARGE_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";

export const getLFPs = async () =>
  clientApi
    .get<never, AxiosResponse<ILFPResponse[]>>(`/lfp/groups`)
    .then((res) => res.data);

export const useGetLFPs = () => {
  return useQuery({
    queryKey: ["lfp", "user"],
    queryFn: getLFPs,
    staleTime: Infinity,
    retryDelay: LARGE_QUERY_RETRY_DELAY,
    retry: LARGE_QUERY_RETRY_ATTEMPTS,
    enabled: getAccessToken() !== null,
  });
};
