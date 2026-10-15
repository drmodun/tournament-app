"use client";

import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useApiMutation } from "api/client/useApiMutation";

export const acceptGroupInvite = async (groupId?: number) => {
  return clientApi
    .post<never, AxiosResponse>(`/group-invites/${groupId}/accept`, {
      params: {
        groupId: groupId,
      },
    })
    .then((res) => res.data);
};
export const useAcceptGroupInvite = () =>
  useApiMutation({
    mutationFn: acceptGroupInvite,
    size: "small",
    pending: "accepting group invite...",
    success: "successfully accepted group invite",
    invalidate: ["groupInvite", "group"],
  });
