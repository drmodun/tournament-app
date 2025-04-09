"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateQuizDto } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosError, AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { invalidateQuizzes } from "./serverFetches";
import { handleError } from "utils/mixins/helpers";

export const createQuiz = async (data: CreateQuizDto) =>
  clientApi
    .post<never, AxiosResponse<{ id: number }>>(`/quiz`, data)
    .then((res) => res.data);

export const useCreateQuiz = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuiz,
    onSuccess: async (data) => {
      toast.addToast("quiz created successfully", "success");
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.includes("quizzes") ||
          query.queryKey.includes("authored-quizzes"),
      });
      invalidateQuizzes();
      return data;
    },
    onError: (e: AxiosError<{ message: string & string[] }>) => {
      const err = handleError(e);
      err && toast.addToast(err, "error");
    },
  });
};
