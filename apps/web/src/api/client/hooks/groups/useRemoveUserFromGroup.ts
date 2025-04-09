"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { invalidateGroups } from "./serverFetches";
import { handleError } from "utils/mixins/helpers";

export const removeUser = async (data: { groupId: number; userId: number }) =>
  clientApi
    .delete<
      never,
      AxiosResponse
    >(`/group-membership/${data.groupId}/${data.userId}`)
    .then((res) => res.data);

export const useRemoveUserFromGroup = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeUser,
    retryDelay: 10000,
    onSuccess: async () => {
      toast.addToast("successfully removed user from group", "success");
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
      toast.addToast("removing user from group...", "info");
    },
  });
};
