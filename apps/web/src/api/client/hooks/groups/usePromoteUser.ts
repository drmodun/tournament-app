"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupRoleEnum } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { invalidateGroups } from "./serverFetches";
import { handleError } from "utils/mixins/helpers";

export const promoteUser = async (data: { groupId: number; userId: number }) =>
  clientApi
    .patch<never, AxiosResponse>(
      `/group-membership/${data.groupId}/${data.userId}`,
      {
        role: groupRoleEnum.ADMIN,
      }
    )
    .then((res) => res.data);

export const usePromoteUser = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: promoteUser,
    retryDelay: 10000,
    onSuccess: async () => {
      toast.addToast("successfully promoted user", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("group"),
      });
      invalidateGroups();
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("promoting user...", "info");
    },
  });
};
