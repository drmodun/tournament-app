"use client";

import { IUpdateUserInfo } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { invalidateUser } from "./serverFetches";
import { useApiMutation } from "api/client/useApiMutation";

export const updateUser = async (updateFields: IUpdateUserInfo) => {
  return clientApi
    .patch<never, AxiosResponse<IUpdateUserInfo>>(`/users`, updateFields)
    .then((res) => res.data);
};

export const useUpdateUser = () =>
  useApiMutation({
    mutationFn: updateUser,
    size: "medium",
    pending: "updating user...",
    success: "successfully updated user",
    invalidate: ["me", "user"],
    afterSuccess: invalidateUser,
  });
