"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { IExtendedUserResponse } from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
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

  return useMutation({
    mutationKey: ["me"],
    mutationFn: removeUser,
    retryDelay: 10000,
    onSuccess: async (data) => {
      toast.addToast("successfully removed user from group", "success");
    },
    onError: (error: any) => {
      toast.addToast(
        "an error occurred while removing user from group..",
        "error",
      );
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("removing user from group...", "info");
    },
  });
};
