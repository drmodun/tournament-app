"use client";

import { IResetPasswordRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "utils/hooks/useToastContext";
import { useRouter } from "next/navigation";
import { AxiosError, AxiosResponse } from "axios";
import { handleError } from "utils/mixins/helpers";

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
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("me"),
      });
      toast.addToast("successfully reset password", "success");

      setTimeout(() => navigate.push("/login"), 1000);
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("resetting password...", "info");
    },
    retryDelay: 5000,
  });
};
