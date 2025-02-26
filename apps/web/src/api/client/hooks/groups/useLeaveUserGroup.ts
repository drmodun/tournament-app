"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { IExtendedUserResponse } from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const leaveUserGroup = async (groupId: number | undefined) =>
  clientApi
    .delete<never, AxiosResponse>(`/group-membership/${groupId}/leave`)
    .then((res) => res.data);

export const useLeaveUserGroup = () => {
  const toast = useToastContext();

  return useMutation({
    mutationKey: ["me"],
    mutationFn: leaveUserGroup,
    retryDelay: 5000,
    onSuccess: async (data) => {
      toast.addToast("successfully left group", "success");
    },
    onError: (error: any) => {
      toast.addToast("an error occurred..", "error");
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("leaving group...", "info");
    },
  });
};
