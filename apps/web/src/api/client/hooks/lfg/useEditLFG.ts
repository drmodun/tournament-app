"use client";

import { IUpdateLFGRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useApiMutation } from "api/client/useApiMutation";

export const UpdateLFG = async (data: {
  message?: string;
  categoryIds?: number[];
  id?: number;
}) => {
  console.log("category ids", data.categoryIds ?? []);
  return clientApi
    .patch<IUpdateLFGRequest, AxiosResponse>(`/lfg/${data.id}`, {
      id: data.id,
      categoryIds: data?.categoryIds ?? [],
      message: data?.message,
    })
    .then((res) => res.data);
};
export const useUpdateLFG = () =>
  useApiMutation({
    mutationFn: UpdateLFG,
    size: "small",
    pending: "updating LFG...",
    success: "successfully updated LFG",
    invalidate: ["lfg"],
  });
