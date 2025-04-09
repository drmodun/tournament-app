"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientApi,
  MEDIUM_QUERY_RETRY_ATTEMPTS,
  MEDIUM_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { useToastContext } from "utils/hooks/useToastContext";
import { handleError } from "utils/mixins/helpers";

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCompetition,
    retryDelay: MEDIUM_QUERY_RETRY_DELAY,
    retry: MEDIUM_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully deleted competition", "success");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("competition"),
      });
      router.push("/manageCompetitions");
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("deleting competition...", "info");
    },
  });
};
