"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const declineGroupInvite = async (groupId?: number) => {
  return clientApi
    .delete<never, AxiosResponse>(`/group-invites/${groupId}/reject`, {
      params: {
        groupId: groupId,
      },
    })
    .then((res) => res.data);
};
export const useDeclineGroupInvite = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: declineGroupInvite,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully rejected group invite", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("groupInvite"),
      });
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("group"),
      });
      return true;
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        toast.addToast("you have already rejected this group", "error");
      } else {
        toast.addToast(error.message ?? "an error occurred...", "error");
      }
      console.error(error);
      return false;
    },
    onMutate: () => {
      toast.addToast("rejecting group invite...", "info");
    },
  });
};
