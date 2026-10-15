"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateQuizDto } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { toastHandlers } from "api/client/toastHandlers";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { invalidateQuizzes } from "./serverFetches";

export interface UpdateQuizParams {
  id: number;
  data: UpdateQuizDto;
}

export const updateQuiz = async ({ id, data }: UpdateQuizParams) =>
  clientApi
    .put<never, AxiosResponse<{ id: number }>>(`/quiz/${id}`, data)
    .then((res) => res.data);

export const useUpdateQuiz = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateQuiz,
    onSuccess: async (data, variables) => {
      toast.addToast("Quiz updated successfully", "success");
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.includes("quizzes") ||
          query.queryKey.includes("authored-quizzes") ||
          (Array.isArray(query.queryKey) &&
            query.queryKey[0] === "quiz" &&
            query.queryKey[1] === variables.id) ||
          (Array.isArray(query.queryKey) &&
            query.queryKey[0] === "detailed-quiz" &&
            query.queryKey[1] === variables.id),
      });
      invalidateQuizzes();
      return data;
    },
    ...toastHandlers(toast, "Updating quiz..."),
  });
};
