"use client";

import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useApiMutation } from "api/client/useApiMutation";

export const deleteLFP = async (data: { groupId?: number; id?: number }) =>
  clientApi
    .delete<never, AxiosResponse>(`/lfp/${data?.groupId}/${data.id}`, {
      params: {
        groupId: data?.groupId,
        id: data?.id,
      },
    })
    .then((res) => res.data);

export const useDeleteLFP = () =>
  useApiMutation({
    mutationFn: deleteLFP,
    size: "small",
    pending: "deleting LFP...",
    success: "successfully deleted LFP",
    invalidate: ["lfp"],
  });
