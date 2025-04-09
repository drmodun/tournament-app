"use client";

import {
  IEmailPasswordLoginRequest,
  IUserLoginResponse,
} from "@tournament-app/types";
import { clientApi, setAuthTokens } from "api/client/base";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "utils/hooks/useToastContext";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { AxiosError, AxiosResponse } from "axios";
import { handleError } from "utils/mixins/helpers";

export const loginUser = async (data: IEmailPasswordLoginRequest) =>
  clientApi
    .post<
      IEmailPasswordLoginRequest,
      AxiosResponse<IUserLoginResponse>
    >("/auth/login", data)
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
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("logging in...", "info");
    },
    retryDelay: 5000,
  });
};
