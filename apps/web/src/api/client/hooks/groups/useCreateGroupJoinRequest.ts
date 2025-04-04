"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const createGroupJoinRequest = async (data: {
  groupId: number;
  message: string;
}) =>
  clientApi
    .post<
      never,
      AxiosResponse
    >(`/group-join-requests/${data?.groupId}`, { params: { groupId: data?.groupId }, message: data?.message })
    .then((res) => res.data);

export const useCreateGroupJoinRequest = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroupJoinRequest,
    retryDelay: 5000,
    onSuccess: async (data) => {
      toast.addToast("successfully created a group join request", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("gjr"),
      });
      return true;
    },
    onError: (error: any) => {
      toast.addToast(
        error.response?.data?.message ??
          error.message ??
          "an error occurred...",
        "error",
      );
      console.error(error);
      return false;
    },
    onMutate: () => {
      toast.addToast("creating group join request...", "info");
    },
  });
};
