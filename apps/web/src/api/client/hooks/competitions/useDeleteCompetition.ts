"use client";

import { useMutation } from "@tanstack/react-query";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { useToastContext } from "utils/hooks/useToastContext";

export const deleteCompetition = async (id: number) =>
  clientApi
    .delete<
      never,
      AxiosResponse<{ id: number }>
    >(`/tournaments/${id}`, { params: { id } })
    .then((res) => res.data);

export const useDeleteCompetition = () => {
  const toast = useToastContext();
  const router = useRouter();

  return useMutation({
    mutationKey: ["me"],
    mutationFn: deleteCompetition,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    onSuccess: async (data) => {
      toast.addToast("successfully deleted competition", "success");
      router.push("/manageCompetitions");
    },
    onError: (error: any) => {
      toast.addToast(
        "an error occurred while deleting the competition..",
        "error",
      );
      console.error(error);
      console.log(error.message);
    },
    onMutate: () => {
      toast.addToast("deleting competition...", "info");
    },
  });
};
