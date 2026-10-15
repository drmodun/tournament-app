"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ICreateGroupRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { toastHandlers } from "api/client/toastHandlers";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { invalidateGroups } from "./serverFetches";

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
      invalidateGroups();
      return true;
    },
    ...toastHandlers(toast, "creating group..."),
  });
};
