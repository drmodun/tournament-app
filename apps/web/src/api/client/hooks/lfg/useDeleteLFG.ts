"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ICreateGroupRequest,
  ICreateLFGRequest,
  ILFGResponse,
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

export const deleteLFG = async (id?: number) =>
  clientApi
    .delete<never, AxiosResponse>(`/lfg/${id}`, { params: { id } })
    .then((res) => res.data);

export const useDeleteLFG = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLFG,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async (data) => {
      toast.addToast("successfully deleted LFG", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("lfg"),
      });
      return true;
    },
    onError: (error: any) => {
      toast.addToast("an error occurred while deleting the LFG..", "error");
      console.error(error);
      return false;
    },
    onMutate: () => {
      toast.addToast("deleting LFG...", "info");
    },
  });
};
