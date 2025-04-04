"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateQuizDto } from "@tournament-app/types";
import { clientApi } from "api/client/base";
import { AxiosResponse } from "axios";
import { useToastContext } from "utils/hooks/useToastContext";

interface UpdateQuizParams {
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
      return data;
    },
    onError: (error: any) => {
      if (error.response?.status === 413) {
        toast.addToast(
          "Image too large, please select an image under 2MB",
          "error",
        );
      } else {
        toast.addToast(error.message ?? "Failed to update quiz", "error");
      }
      console.error(error);
      return false;
    },
    onMutate: () => {
      toast.addToast("Updating quiz...", "info");
    },
  });
};
