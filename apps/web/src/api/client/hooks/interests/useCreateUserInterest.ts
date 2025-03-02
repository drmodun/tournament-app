"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ICreateGroupInviteDto,
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

export const createUserInterest = async (categoryId?: number) => {
  return clientApi
    .post<never, AxiosResponse>(`/interest/${categoryId}`, {
      params: {
        categoryId,
      },
    })
    .then((res) => res.data);
};
export const useCreateUserInterest = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserInterest,
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async (data, variables) => {
      toast.addToast("successfully created interest", "success");
      await queryClient.invalidateQueries({
        queryKey: ["interest", "lfg"],
      });
      return true;
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        toast.addToast(
          "you have already invited this user to this group",
          "error",
        );
      } else {
        toast.addToast(
          "an error occurred while creating the group invite..",
          "error",
        );
      }
      console.error(error);
      return false;
    },
    onMutate: () => {
      toast.addToast("creating group invite...", "info");
    },
  });
};
