"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ICreateGroupRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { toastHandlers } from "api/client/toastHandlers";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

export const editGroup = async (
  data: Partial<ICreateGroupRequest>,
  groupId: number,
) =>
  clientApi
    .patch<never, AxiosResponse<any>>(`/groups/${groupId}`, data)
    .then((res) => res.data);

export const useEditGroup = (groupId: number) => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ICreateGroupRequest>) =>
      editGroup(data, groupId),
    retryDelay: 10000,
    onSuccess: async () => {
      toast.addToast("successfully updated group", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("group"),
      });
      return true;
    },
    ...toastHandlers(toast, "updating group..."),
  });
};
