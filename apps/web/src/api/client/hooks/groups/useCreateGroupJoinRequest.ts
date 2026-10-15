"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { toastHandlers } from "api/client/toastHandlers";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { invalidateGroups } from "./serverFetches";

export const createGroupJoinRequest = async (data: {
  groupId: number;
  message: string;
}) =>
  clientApi
    .post<never, AxiosResponse>(`/group-join-requests/${data?.groupId}`, {
      params: { groupId: data?.groupId },
      message: data?.message,
    })
    .then((res) => res.data);

export const useCreateGroupJoinRequest = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroupJoinRequest,
    retryDelay: 5000,
    onSuccess: async () => {
      toast.addToast("successfully created a group join request", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("gjr"),
      });
      invalidateGroups();
      return true;
    },
    ...toastHandlers(toast, "creating group join request..."),
  });
};
