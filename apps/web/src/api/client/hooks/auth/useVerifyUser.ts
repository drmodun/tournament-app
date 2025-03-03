"use client";

import {
  ICreateUserRequest,
  IEmailPasswordLoginRequest,
  IUserLoginResponse,
} from "@tournament-app/types";
import {
  clientApi,
  setAuthTokens,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "utils/hooks/useToastContext";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
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
