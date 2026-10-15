"use client";

import { ICreateLFPRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useApiMutation } from "api/client/useApiMutation";

export const editLFP = async (data: {
  id?: number;
  groupId?: number;
  message?: string;
}) =>
  clientApi
    .patch<ICreateLFPRequest, AxiosResponse>(
      `/lfp/${data?.groupId}/${data?.id}`,
      {
        message: data?.message,
        params: {
          groupId: data?.groupId,
          id: data?.groupId,
        },
      },
    )
    .then((res) => res.data);

export const useEditLFP = () =>
  useApiMutation({
    mutationFn: editLFP,
    size: "small",
    pending: "editing LFP...",
    success: "successfully edited LFP",
    invalidate: ["lfp"],
  });
