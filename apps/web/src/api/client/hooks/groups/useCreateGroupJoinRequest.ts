"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ICreateGroupRequest } from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";
import { useEffect } from "react";
import { useToastContext } from "utils/hooks/useToastContext";

export const createGroupJoinRequest = async (data: {
  groupId: number;
  message: string;
}) =>
  clientApi
    .post<
      never,
      AxiosResponse
    >(`/group-join-requests/${data?.groupId}`, { params: { groupId: data?.groupId }, body: { message: data?.message } })
    .then((res) => res.data);

export const useCreateGroupJoinRequest = () => {
  const toast = useToastContext();

  return useMutation({
    mutationKey: ["groups"],
    mutationFn: createGroupJoinRequest,
    retryDelay: 5000,
    onSuccess: async (data) => {
      toast.addToast("successfully created a group join request", "success");
      return true;
    },
    onError: (error: any) => {
      toast.addToast("an error occurred..", "error");
      console.error(error);
      return false;
    },
    onMutate: () => {
      toast.addToast("creating group join request...", "info");
    },
  });
};
