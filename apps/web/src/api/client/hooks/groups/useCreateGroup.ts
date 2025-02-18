"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ICreateGroupRequest } from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";
import { useEffect } from "react";
import { useToastContext } from "utils/hooks/useToastContext";

export const createGroup = async (data: ICreateGroupRequest) =>
  clientApi
    .post<never, AxiosResponse<any>>(`/groups`, data)
    .then((res) => res.data);

export const useCreateGroup = () => {
  const toast = useToastContext();

  return useMutation({
    mutationKey: ["groups"],
    mutationFn: createGroup,
    retryDelay: 10000,
    onSuccess: async (data) => {
      toast.addToast("successfully created group", "success");
      return true;
    },
    onError: (error: any) => {
      if (error.response.status === 413) {
        toast.addToast(
          "logo too large, place select an image under 2MB",
          "error",
        );
      } else {
        toast.addToast("an error occurred..", "error");
      }
      console.error(error);
      return false;
    },
    onMutate: () => {
      toast.addToast("creating group...", "info");
    },
  });
};
