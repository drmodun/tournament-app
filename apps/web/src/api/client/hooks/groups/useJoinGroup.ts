"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ICreateGroupRequest } from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";
import { useEffect } from "react";
import { useToastContext } from "utils/hooks/useToastContext";

export const joinGroup = async (data: { groupId?: number; userId?: number }) =>
  clientApi
    .post<
      never,
      AxiosResponse
    >(`/group-membership/${data?.groupId}/${data?.userId}`, data)
    .then((res) => res.data);

export const useJoinGroup = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinGroup,
    retryDelay: 5000,
    onSuccess: async (data) => {
      toast.addToast("successfully joined the group", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("group"),
      });
      return true;
    },
    onError: (error: any) => {
      toast.addToast("an error occurred while joining the group..", "error");
      console.error(error);
      return false;
    },
    onMutate: () => {
      toast.addToast("joining the group...", "info");
    },
  });
};
