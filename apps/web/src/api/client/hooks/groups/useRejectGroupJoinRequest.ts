"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const rejectGroupJoinRequest = async (data: {
  groupId: number | undefined;
  userId: number | undefined;
}) =>
  clientApi
    .delete<
      never,
      AxiosResponse<never>
    >(`/group-join-requests/${data?.groupId}/${data?.userId}/reject`)
    .then((res) => res.data);

export const useRejectGroupJoinRequest = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectGroupJoinRequest,
    retryDelay: 10000,
    onSuccess: async () => {
      toast.addToast("successfully rejected join request", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("gjr"),
      });
    },
    onError: (error: any) => {
      toast.addToast("an error occurred..", "error");
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("rejecting join request...", "info");
    },
  });
};
