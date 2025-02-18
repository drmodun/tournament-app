"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { IExtendedUserResponse } from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

type UpdateUserInfo = {
  id: number;
  profilePicture?: string;
  country?: string;
  username?: string;
  name?: string;
  bio?: string;
  location?: string;
};
export const updateUser = async (updateFields: UpdateUserInfo) => {
  const { id, ...data } = updateFields;
  return clientApi
    .patch<never, AxiosResponse<UpdateUserInfo>>(`/users/${id}`, data)
    .then((res) => res.data);
};

export const useUpdateUser = () => {
  const toast = useToastContext();
  return useMutation({
    mutationKey: ["me"],
    mutationFn: updateUser,
    retryDelay: 10000,
    onSuccess: async (data) => {
      toast.addToast("successfully updated user", "success");
    },
    onError: (error: any) => {
      toast.addToast("invalid credentials", "error"); //TODO: maybe make this show the server error message, or just log it
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("logging in...", "info");
    },
  });
};
