"use client";

import { IApiTokenResponse } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { useApiMutation } from "api/client/useApiMutation";
import { AxiosResponse } from "axios";

export const revokeApiToken = async (id: number) =>
  clientApi
    .delete<never, AxiosResponse<IApiTokenResponse>>(`/auth/tokens/${id}`)
    .then((res) => res.data);

export const useRevokeApiToken = () =>
  useApiMutation({
    mutationFn: revokeApiToken,
    size: "small",
    pending: "revoking API token...",
    success: "successfully revoked API token",
    invalidate: ["api-tokens"],
  });
