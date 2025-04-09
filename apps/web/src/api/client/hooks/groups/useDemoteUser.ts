"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupRoleEnum } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { handleError } from "utils/mixins/helpers";

export const demoteUser = async (data: { groupId: number; userId: number }) =>
  clientApi
    .patch<never, AxiosResponse>(
      `/group-membership/${data.groupId}/${data.userId}`,
      {
        role: groupRoleEnum.MEMBER,
      }
    )
    .then((res) => res.data);

export const useDemoteUser = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: demoteUser,
    retryDelay: 10000,
    onSuccess: async () => {
      toast.addToast("successfully demoted user", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("group"),
      });
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("demoting user...", "info");
    },
  });
};
