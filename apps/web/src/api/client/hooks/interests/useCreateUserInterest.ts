"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const createUserInterest = async (categoryId?: number) => {
  return clientApi
    .post<never, AxiosResponse>(`/interest/${categoryId}`, {
      params: {
        categoryId,
      },
    })
    .then((res) => res.data);
};
export const useCreateUserInterest = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserInterest,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully created interest", "success");
      await queryClient.invalidateQueries({
        queryKey: ["interest", "lfg"],
      });
      return true;
    },
    onError: (error: any) => {
      toast.addToast("an error occurred..", "error");
      console.error(error);
      return false;
    },
    onMutate: () => {
      toast.addToast("creating interest...", "info");
    },
  });
};
