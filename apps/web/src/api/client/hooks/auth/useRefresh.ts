"use client";

import { IUserLoginResponse } from "@tournament-app/types";
import { clientApi, getRefreshToken, setAuthTokens } from "api/client/base";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "utils/hooks/useToastContext";
import { useAuth } from "./useAuth";
import { AxiosError, AxiosResponse } from "axios";
import { handleError } from "utils/mixins/helpers";

export const refreshUser = async () =>
  clientApi
    .get<never, AxiosResponse<IUserLoginResponse>>("/auth/refresh", {
      headers: {
        Authorization: `Bearer ${getRefreshToken()}`,
      },
    })
    .then((res) => res.data);

export const useRefresh = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();
  const { refetch } = useAuth();

  return useMutation({
    mutationFn: refreshUser,
    onSuccess: async (data) => {
      setAuthTokens(data.accessToken, data.refreshToken);
      await refetch();
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("me"),
      });
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
  });
};
