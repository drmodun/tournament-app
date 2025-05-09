"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ICreateGroupInviteDto } from "@tournament-app/types";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { handleError } from "utils/mixins/helpers";

export const createGroupInvite = async (data: {
  groupId?: number;
  userId?: number;
  message?: string;
  relatedLFGId?: number;
}) => {
  return clientApi
    .post<ICreateGroupInviteDto, AxiosResponse>(
      `/group-invites/${data?.groupId}/${data?.userId}`,
      {
        message: data?.message ?? "this group wants you to join their team!",
        relatedLFGId: data?.relatedLFGId,
        params: {
          groupId: data?.groupId,
          userId: data?.userId,
        },
      },
    )
    .then((res) => res.data);
};
export const useCreateGroupInvite = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroupInvite,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async (data, variables) => {
      toast.addToast("successfully created group invite", "success");
      await queryClient.invalidateQueries({
        queryKey: ["lfg", "team", variables.groupId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["me", "lfg", variables.groupId],
      });

      return true;
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("creating group invite...", "info");
    },
  });
};
