"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IExtendedUserResponse } from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const acceptGroupJoinRequest = async (data: {
  groupId: number | undefined;
  userId: number | undefined;
}) =>
  clientApi
    .post<
      never,
      AxiosResponse<never>
    >(`/group-join-requests/${data?.groupId}/${data?.userId}/accept`)
    .then((res) => res.data);

export const useAcceptGroupJoinRequest = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptGroupJoinRequest,
    retryDelay: 10000,
    onSuccess: async (data) => {
      toast.addToast("successfully accepted join request", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("gjr"),
      });
    },
    onError: (error: any) => {
      toast.addToast("an error occurred..", "error");
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("accepting join request...", "info");
    },
  });
};
