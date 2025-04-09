"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { invalidateGroups } from "./serverFetches";
import { handleError } from "utils/mixins/helpers";

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
      invalidateGroups();
      return true;
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("creating group join request...", "info");
    },
  });
};
