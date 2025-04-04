"use client";

import {
  clientApi,
  LARGE_QUERY_RETRY_DELAY,
  SMALL_QUERY_RETRY_ATTEMPTS,
} from "api/client/base";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "utils/hooks/useToastContext";
import { useRouter } from "next/navigation";
import { AxiosResponse } from "axios";

export const requestPasswordReset = async (email?: string) =>
  clientApi
    .get<any, AxiosResponse>(`/auth/password-reset-request/${email}`)
    .then((res) => res.data);

export const useRequestPasswordReset = () => {
  const toast = useToastContext();
  const navigate = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("me"),
      });
      toast.addToast(
        "successfully sent reset password request, check your email",
        "success",
      );

      setTimeout(() => navigate.push("/login"), 1000);
    },
    onError: (error: any) => {
      toast.addToast(
        error.response?.data?.message ??
          error.message ??
          "an error occurred...",
        "error",
      );
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("sending mail...", "info");
    },
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    retryDelay: LARGE_QUERY_RETRY_DELAY,
  });
};
