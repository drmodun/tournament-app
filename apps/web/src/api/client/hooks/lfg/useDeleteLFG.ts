"use client";

import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useApiMutation } from "api/client/useApiMutation";

export const deleteLFG = async (id?: number) =>
  clientApi
    .delete<never, AxiosResponse>(`/lfg/${id}`, { params: { id } })
    .then((res) => res.data);

export const useDeleteLFG = () =>
  useApiMutation({
    mutationFn: deleteLFG,
    size: "small",
    pending: "deleting LFG...",
    success: "successfully deleted LFG",
    invalidate: ["lfg"],
  });
