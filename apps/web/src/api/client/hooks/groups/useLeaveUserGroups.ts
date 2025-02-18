"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { IExtendedUserResponse } from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

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

  return useMutation({
    mutationKey: ["me"],
    mutationFn: leaveUserGroups,
    retryDelay: 10000,
    onSuccess: async (data) => {
      toast.addToast("successfully left groups", "success");
    },
    onError: (error: any) => {
      toast.addToast("an error occurred..", "error");
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("leaving groups...", "info");
    },
  });
};
