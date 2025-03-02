"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ICreateGroupRequest,
  ICreateLFPRequest,
  ILFPResponse,
} from "@tournament-app/types";
import {
  clientApi,
  getAccessToken,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useEffect } from "react";
import { useToastContext } from "utils/hooks/useToastContext";

export const deleteLFP = async (data: { groupId?: number; id?: number }) =>
  clientApi
    .delete<never, AxiosResponse>(`/lfp/${data?.groupId}/${data.id}`, {
      params: {
        groupId: data?.groupId,
        id: data?.id,
      },
    })
    .then((res) => res.data);

export const useDeleteLFP = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLFP,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async (data) => {
      toast.addToast("successfully deleted LFP", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("lfp"),
      });
      return true;
    },
    onError: (error: any) => {
      toast.addToast("an error occurred while deleting the LFP..", "error");
      console.error(error);
      return false;
    },
    onMutate: () => {
      toast.addToast("deleting LFP...", "info");
    },
  });
};
