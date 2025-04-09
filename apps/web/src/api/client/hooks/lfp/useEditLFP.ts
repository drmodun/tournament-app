"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ICreateLFPRequest } from "@tournament-app/types";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { handleError } from "utils/mixins/helpers";

export const editLFP = async (data: {
  id?: number;
  groupId?: number;
  message?: string;
}) =>
  clientApi
    .patch<ICreateLFPRequest, AxiosResponse>(
      `/lfp/${data?.groupId}/${data?.id}`,
      {
        message: data?.message,
        params: {
          groupId: data?.groupId,
          id: data?.groupId,
        },
      }
    )
    .then((res) => res.data);

export const useEditLFP = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editLFP,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully edited LFP", "success");
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
      toast.addToast("editing LFP...", "info");
    },
  });
};
