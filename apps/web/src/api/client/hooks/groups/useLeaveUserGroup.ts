"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { invalidateGroups } from "./serverFetches";
import { handleError } from "utils/mixins/helpers";

export const leaveUserGroup = async (groupId: number | undefined) =>
  clientApi
    .delete<never, AxiosResponse>(`/group-membership/${groupId}/leave`)
    .then((res) => res.data);

export const useLeaveUserGroup = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveUserGroup,
    retryDelay: 5000,
    onSuccess: async () => {
      toast.addToast("successfully left group", "success");
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
      toast.addToast("leaving group...", "info");
    },
  });
};
