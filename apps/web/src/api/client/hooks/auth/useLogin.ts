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
import { AxiosResponse } from "axios";

export const loginUser = async (data: IEmailPasswordLoginRequest) =>
  clientApi
    .post<
      IEmailPasswordLoginRequest,
      AxiosResponse<IUserLoginResponse>
    >("/auth/login", data)
    .then((res) => res.data);
// TODO: make google login later

export const useLogin = () => {
  const toast = useToastContext();
  const navigate = useRouter();
  const queryClient = useQueryClient();
  const { refetch, isSuccess } = useAuth();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      setAuthTokens(data.accessToken, data.refreshToken);
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("me"),
      });
      toast.addToast("successfully logged in", "success"); //TODO: make this an object for easier and more consistent usage
      await refetch();

      setTimeout(() => navigate.push("/"), 1000);
    },
    onError: (error: any) => {
      toast.addToast("invalid credentials", "error"); //TODO: maybe make this show the server error message, or just log it
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("logging in...", "info");
    },
    retryDelay: 5000,
  });
};
