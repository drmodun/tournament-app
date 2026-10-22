"use client";

import {
  ICreateApiTokenRequest,
  ICreatedApiTokenResponse,
} from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { useApiMutation } from "api/client/useApiMutation";
import { AxiosResponse } from "axios";

export const createApiToken = async (data: ICreateApiTokenRequest) =>
  clientApi
    .post<never, AxiosResponse<ICreatedApiTokenResponse>>("/auth/tokens", data)
    .then((res) => res.data);

// The response holds the token itself, the only time it is shown
export const useCreateApiToken = () =>
  useApiMutation({
    mutationFn: createApiToken,
    size: "small",
    pending: "creating API token...",
    success: "successfully created API token",
    invalidate: ["api-tokens"],
  });
