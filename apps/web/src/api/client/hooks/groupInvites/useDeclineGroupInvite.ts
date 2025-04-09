"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { handleError } from "utils/mixins/helpers";

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
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("rejecting group invite...", "info");
    },
  });
};
