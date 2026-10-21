"use client";

import { ICreateUserRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { toastHandlers } from "api/client/toastHandlers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "utils/hooks/useToastContext";
import { useRouter } from "next/navigation";
import { AxiosResponse } from "axios";

// Uploads need a signed-in user, so a picture chosen while registering (a data URL) goes with the
// sign-up itself, as a multipart form
const withPicture = async ({ profilePicture, ...data }: ICreateUserRequest) => {
  const body = new FormData();

  for (const [name, value] of Object.entries(data)) {
    if (value != null) {
      body.append(
        name,
        value instanceof Date ? value.toISOString() : String(value),
      );
    }
  }

  body.append(
    "profilePicture",
    await (await fetch(profilePicture as string)).blob(),
    "profile-picture",
  );

  return body;
};

export const registerUser = async (data: ICreateUserRequest) => {
  if (!data.profilePicture?.startsWith("data:")) {
    return clientApi
      .post<ICreateUserRequest, AxiosResponse<{ id: number }>>("/users", data)
      .then((res) => res.data);
  }

  return clientApi
    .post<FormData, AxiosResponse<{ id: number }>>(
      "/users",
      await withPicture(data),
      // The browser sets the multipart boundary itself
      { headers: { "Content-Type": undefined } },
    )
    .then((res) => res.data);
};

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
    ...toastHandlers(toast, "creating account..."),
  });
};
