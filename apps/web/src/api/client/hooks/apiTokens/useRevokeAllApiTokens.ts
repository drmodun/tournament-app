"use client";

import { IRevokeAllApiTokensResponse } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { useApiMutation } from "api/client/useApiMutation";
import { AxiosResponse } from "axios";

export const revokeAllApiTokens = async () =>
  clientApi
    .delete<never, AxiosResponse<IRevokeAllApiTokensResponse>>("/auth/tokens")
    .then((res) => res.data);

export const useRevokeAllApiTokens = () =>
  useApiMutation({
    mutationFn: revokeAllApiTokens,
    size: "small",
    pending: "revoking all API tokens...",
    success: "successfully revoked all API tokens",
    invalidate: ["api-tokens"],
  });
