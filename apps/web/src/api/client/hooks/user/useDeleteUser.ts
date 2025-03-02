"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IExtendedUserResponse, IUpdateUserInfo } from "@tournament-app/types";
import { clientApi, getAccessToken } from "api/client/base";
import { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { useToastContext } from "utils/hooks/useToastContext";

export const deleteUser = async (id: number | undefined) => {
  return clientApi
    .delete<{ id: number }, AxiosResponse<{ id: number }>>(`/users/${id}`)
    .then((res) => res.data);
};

export const useDeleteUser = (id: number | undefined) => {
  const toast = useToastContext();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteUser(id),
    retryDelay: 10000,
    retry: 3,
    onSuccess: async (data) => {
      toast.addToast("successfully deleted user", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("user"),
      });
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("me"),
      });
      router.push("/");
    },
    onError: (error: any) => {
      toast.addToast("an error occurred while deleting the user", "error");
      console.error(error);
    },
    onMutate: () => {
      toast.addToast("deleting user...", "info");
    },
  });
};
