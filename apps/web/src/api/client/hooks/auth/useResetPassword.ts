"use client";

import {
  IEmailPasswordLoginRequest,
  IResetPasswordRequest,
  IUserLoginResponse,
} from "@tournament-app/types";
import { clientApi, setAuthTokens } from "api/client/base";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "utils/hooks/useToastContext";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { AxiosResponse } from "axios";

export const resetPassword = async (token?: string, password?: string) =>
  clientApi
    .post<
      IResetPasswordRequest,
      AxiosResponse
    >(`/auth/password-reset/${token}`, { password })
    .then((res) => res.data);

export const useResetPassword = (token?: string) => {
  const toast = useToastContext();
  const navigate = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password?: string) => resetPassword(token, password),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("me"),
      });
      toast.addToast("successfully reset password", "success");

      setTimeout(() => navigate.push("/login"), 1000);
    },
    onError: (error: any) => {
      toast.addToast("an error occurred...", "error");
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("resetting password...", "info");
    },
    retryDelay: 5000,
  });
};
