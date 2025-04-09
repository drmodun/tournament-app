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

export const deleteLFP = async (data: { groupId?: number; id?: number }) =>
  clientApi
    .delete<never, AxiosResponse>(`/lfp/${data?.groupId}/${data.id}`, {
      params: {
        groupId: data?.groupId,
        id: data?.id,
      },
    })
    .then((res) => res.data);

export const useDeleteLFP = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLFP,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully deleted LFP", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("lfp"),
      });
      return true;
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("deleting LFP...", "info");
    },
  });
};
