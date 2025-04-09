"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IUpdateUserInfo } from "@tournament-app/types";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { invalidateUser } from "./serverFetches";
import { handleError } from "utils/mixins/helpers";

export const updateUser = async (updateFields: IUpdateUserInfo) => {
  return clientApi
    .patch<never, AxiosResponse<IUpdateUserInfo>>(`/users`, updateFields)
    .then((res) => res.data);
};

export const useUpdateUser = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully updated user", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("me"),
      });
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("user"),
      });
      invalidateUser();
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("updating user...", "info");
    },
  });
};
