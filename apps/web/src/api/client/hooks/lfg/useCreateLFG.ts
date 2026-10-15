"use client";

import { ICreateLFGRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useApiMutation } from "api/client/useApiMutation";

export const createLFG = async (data: {
  message?: string;
  categoryIds?: number[];
}) => {
  data.categoryIds ??= [];
  return clientApi
    .post<ICreateLFGRequest, AxiosResponse>(`/lfg`, data)
    .then((res) => res.data);
};
export const useCreateLFG = () =>
  useApiMutation({
    mutationFn: createLFG,
    size: "small",
    pending: "creating LFG...",
    success: "successfully created LFG",
    invalidate: ["lfg"],
  });
