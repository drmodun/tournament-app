"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

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
      toast.addToast("removing user from group...", "info");
    },
  });
};
