"use client";

import { ICreateUserRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "utils/hooks/useToastContext";
import { useRouter } from "next/navigation";
import { AxiosError, AxiosResponse } from "axios";
import { handleError } from "utils/mixins/helpers";

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
        "success",
      );

      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("me"),
      });

      setTimeout(() => navigate.push("/login"));
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("creating account...", "info");
    },
  });
};
