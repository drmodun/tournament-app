"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "api/client/base";
import { toastHandlers } from "api/client/toastHandlers";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";
import { invalidateQuizzes } from "./serverFetches";

export const deleteQuiz = async (id: number) =>
  clientApi
    .delete<never, AxiosResponse<{ id: number }>>(`/quiz/${id}`)
    .then((res) => res.data);

export const useDeleteQuiz = () => {
  const toast = useToastContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQuiz,
    onSuccess: async (data, id) => {
      toast.addToast("Quiz deleted successfully", "success");
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.includes("quizzes") ||
          query.queryKey.includes("authored-quizzes") ||
          (Array.isArray(query.queryKey) &&
            query.queryKey[0] === "quiz" &&
            query.queryKey[1] === id) ||
          (Array.isArray(query.queryKey) &&
            query.queryKey[0] === "detailed-quiz" &&
            query.queryKey[1] === id),
      });
      invalidateQuizzes();
      return data;
    },
    ...toastHandlers(toast, "Deleting quiz..."),
  });
};
