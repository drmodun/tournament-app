"use client";

import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { invalidateGroups } from "./serverFetches";
import { useApiMutation } from "api/client/useApiMutation";

export const deleteGroup = async (groupId?: number) =>
  clientApi
    .delete<never, AxiosResponse>(`/groups/${groupId}`, {
      params: { groupId: groupId },
    })
    .then((res) => res.data);

export const useDeleteGroup = () =>
  useApiMutation({
    mutationFn: deleteGroup,
    size: "small",
    pending: "deleting the group...",
    success: "successfully deleted the group",
    invalidate: ["group"],
    afterSuccess: invalidateGroups,
  });
