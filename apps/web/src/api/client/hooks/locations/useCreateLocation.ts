"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ICreateLocationRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { handleError } from "utils/mixins/helpers";

export const createLocation = async (data: ICreateLocationRequest) =>
  clientApi
    .post<
      ICreateLocationRequest,
      AxiosResponse<{ id: number }>
    >(`/locations`, data)
    .then((res) => res.data);

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  const toast = useToastContext();

  return useMutation({
    mutationFn: createLocation,
    retryDelay: 2000,
    retry: 3,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("location"),
      });
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
  });
};
