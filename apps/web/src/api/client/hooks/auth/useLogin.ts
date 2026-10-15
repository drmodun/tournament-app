"use client";

import {
  IEmailPasswordLoginRequest,
  IUserLoginResponse,
} from "@tournament-app/types";
import { clientApi, setAuthTokens } from "api/client/base";
import { toastHandlers } from "api/client/toastHandlers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "utils/hooks/useToastContext";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { AxiosResponse } from "axios";

export const loginUser = async (data: IEmailPasswordLoginRequest) =>
  clientApi
    .post<IEmailPasswordLoginRequest, AxiosResponse<IUserLoginResponse>>(
      "/auth/login",
      data,
    )
    .then((res) => res.data);

export const useLogin = () => {
  const toast = useToastContext();
  const navigate = useRouter();
  const queryClient = useQueryClient();
  const { refetch } = useAuth();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      setAuthTokens(data.accessToken, data.refreshToken);
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("me"),
      });
      toast.addToast("successfully logged in", "success");
      await refetch();

      setTimeout(() => navigate.push("/main"), 1000);
    },
    ...toastHandlers(toast, "logging in..."),
    retryDelay: 5000,
  });
};
