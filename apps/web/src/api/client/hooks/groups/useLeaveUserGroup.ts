"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

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
    },
    onError: (error: any) => {
      toast.addToast(
        error.response?.data?.message ??
          error.message ??
          "an error occurred...",
        "error",
      );
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("leaving group...", "info");
    },
  });
};
