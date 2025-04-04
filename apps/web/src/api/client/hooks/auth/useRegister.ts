"use client";

import { ICreateUserRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "utils/hooks/useToastContext";
import { useRouter } from "next/navigation";
import { AxiosResponse } from "axios";

export const registerUser = async (data: ICreateUserRequest) =>
  clientApi
    .post<ICreateUserRequest, AxiosResponse<{ id: number }>>("/users", data)
    .then((res) => res.data);

export const useRegister = () => {
  const toast = useToastContext();
  const navigate = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: async () => {
      toast.addToast(
        "verification email sent! verify your account then login.",
        "success"
      );

      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("me"),
      });

      setTimeout(() => navigate.push("/login"));
    },
    onError: (error: any) => {
      if (error.response?.status === 413) {
        toast.addToast("image too large. must be less than 2mb", "error");
        return;
      }

      toast.addToast(
        error.response?.data?.message ??
          error.message ??
          "an error occurred...",
        "error"
      );
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("creating account...", "info");
    },
  });
};
