"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ICreateLocationRequest } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";

export const createLocation = async (data: ICreateLocationRequest) =>
  clientApi
    .post<
      ICreateLocationRequest,
      AxiosResponse<{ id: number }>
    >(`/locations`, data)
    .then((res) => res.data);

export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLocation,
    retryDelay: 2000,
    retry: 3,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("location"),
      });
    },
  });
};
