import { IUserLoginResponse } from "@tournament-app/types";
import { clientApi, getRefreshToken, setAuthTokens } from "api/client/base";
import { useMutation } from "@tanstack/react-query";
import { useToastContext } from "utils/hooks/useToastContext";
import { useRouter } from "next/router";
import { setTimeout } from "node:timers";
import { useAuth } from "./useAuth";

export const refreshUser = async () =>
  clientApi.post<never, IUserLoginResponse>("/auth/refresh", {
    headers: {
      Authorization: `Bearer ${getRefreshToken()}`,
    },
  });
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
