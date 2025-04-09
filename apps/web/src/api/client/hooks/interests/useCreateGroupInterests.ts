"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientApi,
  SMALL_QUERY_RETRY_ATTEMPTS,
  SMALL_QUERY_RETRY_DELAY,
} from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { handleError } from "utils/mixins/helpers";

export const createGroupInterests = async (
  groupId?: number,
  categoryIds?: number[]
) => {
  const responses: AxiosResponse[] = [];
  for (const categoryId of categoryIds ?? []) {
    clientApi
      .post<never, AxiosResponse>(`/group-interests/${groupId}/${categoryId}`, {
        params: {
          categoryId,
        },
      })
      .then((res) => responses.push(res.data));
  }

  return responses;
};

export const useCreateGroupInterests = (groupId?: number) => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryIds?: number[]) =>
      createGroupInterests(groupId, categoryIds),
    retryDelay: SMALL_QUERY_RETRY_DELAY,
    retry: SMALL_QUERY_RETRY_ATTEMPTS,
    onSuccess: async () => {
      toast.addToast("successfully created interests", "success");
      await queryClient.invalidateQueries({
        queryKey: ["interest"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["lfg"],
      });
      return true;
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
    onMutate: () => {
      toast.addToast("creating interest...", "info");
    },
  });
};
