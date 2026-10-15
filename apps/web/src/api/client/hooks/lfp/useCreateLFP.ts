"use client";

import { ICreateLFPRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useApiMutation } from "api/client/useApiMutation";

export const createLFP = async (data: { groupId?: number; message?: string }) =>
  clientApi
    .post<ICreateLFPRequest, AxiosResponse>(`/lfp/${data?.groupId}`, {
      message: data?.message,
      params: {
        groupId: data?.groupId,
      },
    })
    .then((res) => res.data);

export const useCreateLFP = () =>
  useApiMutation({
    mutationFn: createLFP,
    size: "small",
    pending: "creating LFP...",
    success: "successfully created LFP",
    invalidate: ["lfp"],
  });
