"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ICreateGroupRequest } from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useEffect } from "react";
import { useToastContext } from "utils/hooks/useToastContext";

export const deleteGroup = async (groupId?: number) =>
  clientApi
    .delete<
      never,
      AxiosResponse
    >(`/groups/${groupId}`, { params: { groupId: groupId } })
    .then((res) => res.data);

export const useDeleteGroup = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGroup,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async (data) => {
      toast.addToast("successfully deleted the group", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("group"),
      });
      return true;
    },
    onError: (error: any) => {
      toast.addToast("an error occurred..", "error");
      console.error(error);
      return false;
    },
    onMutate: () => {
      toast.addToast("deleting the group...", "info");
    },
  });
};
