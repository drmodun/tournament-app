"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { toastHandlers } from "api/client/toastHandlers";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const deleteUserInterest = async (categoryId?: number) => {
  return clientApi
    .delete<never, AxiosResponse>(`/interest/${categoryId}`, {
      params: {
        categoryId,
      },
    })
    .then((res) => res.data);
};
export const useDeleteUserInterest = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserInterest,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully deleted interest", "success");
      await queryClient.invalidateQueries({
        queryKey: ["interest"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["lfg"],
      });
      return true;
    },
    ...toastHandlers(toast, "deleting interest..."),
  });
};
