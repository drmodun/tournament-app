"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { useToastContext } from "utils/hooks/useToastContext";
import { invalidateUser } from "./serverFetches";
import { handleError } from "utils/mixins/helpers";

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
      invalidateUser();
      router.push("/");
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("deleting user...", "info");
    },
  });
};
