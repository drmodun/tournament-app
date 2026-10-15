"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { toastHandlers } from "api/client/toastHandlers";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { invalidateGroups } from "./serverFetches";

export const joinGroup = async (data: { groupId?: number; userId?: number }) =>
  clientApi
    .post<never, AxiosResponse>(
      `/group-membership/${data?.groupId}/${data?.userId}`,
      data,
    )
    .then((res) => res.data);

export const useJoinGroup = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinGroup,
    retryDelay: 5000,
    onSuccess: async () => {
      toast.addToast("successfully joined the group", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("group"),
      });
      invalidateGroups();
      return true;
    },
    ...toastHandlers(toast, "joining the group..."),
  });
};
