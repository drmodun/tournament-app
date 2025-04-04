"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { useToastContext } from "utils/hooks/useToastContext";

export const deleteUser = async (id: number | undefined) => {
  return clientApi
    .delete<{ id: number }, AxiosResponse<{ id: number }>>(`/users/${id}`)
    .then((res) => res.data);
};

export const useDeleteUser = (id: number | undefined) => {
  const toast = useToastContext();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteUser(id),
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully deleted user", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("user"),
      });
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("me"),
      });
      router.push("/");
    },
    onError: (error: any) => {
      toast.addToast(
        error.response?.data?.message ??
          error.message ??
          "an error occurred...",
        "error"
      );
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("deleting user...", "info");
    },
  });
};
