"use client";

import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useApiMutation } from "api/client/useApiMutation";

export const declineGroupInvite = async (groupId?: number) => {
  return clientApi
    .delete<never, AxiosResponse>(`/group-invites/${groupId}/reject`, {
      params: {
        groupId: groupId,
      },
    })
    .then((res) => res.data);
};
export const useDeclineGroupInvite = () =>
  useApiMutation({
    mutationFn: declineGroupInvite,
    size: "small",
    pending: "rejecting group invite...",
    success: "successfully rejected group invite",
    invalidate: ["groupInvite", "group"],
  });
