"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const deleteBlockedGroup = async (groupId?: number) => {
  return clientApi
    .delete<never, AxiosResponse>(`/blocked-Groups/${groupId}`)
    .then((res) => res.data);
};
export const useDeleteBlockedGroup = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBlockedGroup,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully unblocked group", "success");
      await queryClient.invalidateQueries({
        queryKey: ["lfg"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["group"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["blocked-groups"],
      });

      return true;
    },
    onError: (error: any) => {
      toast.addToast(error.message ?? "an error occurred...", "error");
      console.error(error);
      return false;
    },
    onMutate: () => {
      toast.addToast("unblocking group...", "info");
    },
  });
};
