"use client";

import { IUserLoginResponse } from "@tournament-app/types";
import { clientApi, getRefreshToken, setAuthTokens } from "api/client/base";
import { useMutation } from "@tanstack/react-query";
import { useToastContext } from "utils/hooks/useToastContext";
import { useAuth } from "./useAuth";
import { AxiosResponse } from "axios";

export const refreshUser = async () =>
  clientApi
    .post<never, AxiosResponse<IUserLoginResponse>>("/auth/refresh", {
      headers: {
        Authorization: `Bearer ${getRefreshToken()}`,
      },
    })
    .then((res) => res.data);
// TODO: make google login later

export const useRefresh = () => {
  const toast = useToastContext();
  const { refetch } = useAuth();

  return useMutation({
    mutationFn: refreshUser,
    onSuccess: async (data) => {
      setAuthTokens(data.accessToken, data.refreshToken);
      await refetch();
    },
    onError: (error: any) => {
      toast.addToast("Login failed", "error");
      console.error(error);
    },
  });
};
