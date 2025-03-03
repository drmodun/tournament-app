"use client";

import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

export const verifyUser = async (token?: string) =>
  clientApi
    .post<
      never,
      AxiosResponse<{ id: number }>
    >(`/auth/email-confirmation/${token}`)
    .then((res) => res.data);

export const useVerifyUser = (token?: string) => {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => verifyUser(token),
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
  });
};
