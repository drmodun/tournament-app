"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ICreateGroupRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const createGroup = async (data: ICreateGroupRequest) =>
  clientApi
    .post<never, AxiosResponse<ICreateGroupRequest>>(`/groups`, data)
    .then((res) => res.data);

export const useCreateGroup = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroup,
    retryDelay: 10000,
    onSuccess: async () => {
      toast.addToast("successfully created group", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("group"),
      });
      return true;
    },
    onError: (error: any) => {
      if (error.response.status === 413) {
        toast.addToast(
          "logo too large, place select an image under 2MB",
          "error",
        );
      } else {
        toast.addToast(error.message ?? "an error occured...", "error");
      }
      console.error(error);
      return false;
    },
    onMutate: () => {
      toast.addToast("creating group...", "info");
    },
  });
};
