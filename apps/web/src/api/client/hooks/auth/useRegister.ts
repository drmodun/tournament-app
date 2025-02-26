"use client";

import {
  ICreateUserRequest,
  IEmailPasswordLoginRequest,
  IUserLoginResponse,
} from "@tournament-app/types";
import { clientApi, setAuthTokens } from "api/client/base";
import { useMutation } from "@tanstack/react-query";
import { useToastContext } from "utils/hooks/useToastContext";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { AxiosResponse } from "axios";

export const registerUser = async (data: ICreateUserRequest) =>
  clientApi
    .post<ICreateUserRequest, AxiosResponse<{ id: number }>>("/users", data)
    .then((res) => res.data);

export const useRegister = () => {
  const toast = useToastContext();
  const navigate = useRouter();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: async (data) => {
      toast.addToast(
        "verification email sent! verify your account then login.",
        "success",
      );

      setTimeout(() => navigate.push("/login"), 1000);
    },
    onError: (error: any) => {
      toast.addToast("an error occurred...", "error");
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("creating account...", "info");
    },
  });
};
