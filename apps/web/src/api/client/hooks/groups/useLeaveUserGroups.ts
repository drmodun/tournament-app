"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { invalidateGroups } from "./serverFetches";
import { handleError } from "utils/mixins/helpers";

export const leaveUserGroups = async (groupIds: number[]) => {
  let responses: AxiosResponse[] = [];
  for (const groupId of groupIds) {
    clientApi
      .delete<never, AxiosResponse>(`/group-membership/${groupId}/leave`)
      .then((res) => {
        responses.push(res.data);
      });
  }

  return responses;
};

export const useLeaveUserGroups = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveUserGroups,
    retryDelay: 10000,
    onSuccess: async () => {
      toast.addToast("successfully left groups", "success");
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
      toast.addToast("leaving groups...", "info");
    },
  });
};
