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

export const createBlockedUser = async (data: {
  groupId?: number;
  userId?: number;
}) => {
  return clientApi
    .post<never, AxiosResponse>(
      `/blocked-users/${data?.groupId}/${data?.userId}`,
      {
        params: {
          groupId: data?.groupId,
          userId: data?.userId,
        },
      },
    )
    .then((res) => res.data);
};
export const useCreateBlockedUser = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBlockedUser,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully blocked user", "success");
      await queryClient.invalidateQueries({
        queryKey: ["lfg"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["group"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["blocked-users"],
      });

      return true;
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("blocking user...", "info");
    },
  });
};
